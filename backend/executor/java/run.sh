#!/bin/sh
# Compile Main.java
javac Main.java 2> /tmp/compile.log
COMPILE_STATUS=$?

if [ $COMPILE_STATUS -ne 0 ]; then
    echo "___COMPILATION_ERROR___"
    cat /tmp/compile.log
    exit 2
fi

# Execute compiled Java program
java Main
