aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE||CREATE_IN_PROGRESS||REVIEW_IN_PROGRESS||DELETE_IN_PROGRESS||DELETE_FAILED||UPDATE_IN_PROGRESS||DELETE_COMPLETE

echo "Enter the stack name to be terminated:"
read s_name

echo "Stack:$s_name - Termination in progress..."

aws cloudformation delete-stack --stack-name $s_name
if [ $? -ne "0" ]
then
  echo "Stack:$s_name - Does not exist!"
  exit 1
fi

aws cloudformation wait stack-delete-complete --stack-name $s_name

echo "Stack:$s_name - Terminated successfully!"