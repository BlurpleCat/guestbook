variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "app_name" {
  type    = string
  default = "guestbook"
}

variable "dynamodb_table_name" {
  type    = string
  default = "guestbook"
}
