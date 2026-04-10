variable "app_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "certificate_arn" {
  type = string
}

variable "hosted_zone_id" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "dynamodb_table_name" {
  type = string
}

variable "container_port" {
  type    = number
  default = 3000
}

variable "cpu" {
  type    = number
  default = 512
}

variable "memory" {
  type    = number
  default = 1024
}

variable "desired_count" {
  type    = number
  default = 2
}
