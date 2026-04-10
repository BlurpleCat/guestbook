terraform {
  backend "s3" {
    bucket = "craig-guestbook-terraform-state"
    key    = "guestbook/main/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

data "aws_acm_certificate" "wildcard" {
  domain      = "*.subvers.io"
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_route53_zone" "main" {
  name = "subvers.io"
}

module "iam" {
  source = "./modules/iam"

  app_name            = var.app_name
  dynamodb_table_name = var.dynamodb_table_name
  aws_region          = data.aws_region.current.name
  aws_account_id      = data.aws_caller_identity.current.account_id
}

module "app" {
  source = "./modules/app"

  app_name                = var.app_name
  aws_region              = data.aws_region.current.name
  vpc_id                  = data.aws_vpc.default.id
  subnet_ids              = data.aws_subnets.public.ids
  certificate_arn         = data.aws_acm_certificate.wildcard.arn
  hosted_zone_id          = data.aws_route53_zone.main.zone_id
  domain_name             = "guestbook.subvers.io"
  task_execution_role_arn = module.iam.task_execution_role_arn
  task_role_arn           = module.iam.task_role_arn
  dynamodb_table_name     = var.dynamodb_table_name
}
