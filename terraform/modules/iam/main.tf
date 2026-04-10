data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# --- ECS Task Execution Role ---

resource "aws_iam_role" "task_execution" {
  name               = "${var.app_name}-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# --- ECS Task Role ---

resource "aws_iam_role" "task" {
  name               = "${var.app_name}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

data "aws_iam_policy_document" "task_dynamodb" {
  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:BatchWriteItem",
      "dynamodb:DescribeTable",
      "dynamodb:CreateTable",
      "dynamodb:DeleteItem",
    ]

    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${var.aws_account_id}:table/${var.dynamodb_table_name}",
    ]
  }
}

resource "aws_iam_role_policy" "task_dynamodb" {
  name   = "${var.app_name}-dynamodb"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task_dynamodb.json
}
