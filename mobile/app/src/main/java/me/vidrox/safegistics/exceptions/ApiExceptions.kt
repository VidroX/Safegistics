package me.vidrox.safegistics.exceptions

import java.io.IOException

data class ApiExceptions(val exceptions: List<ExceptionWithCode>)
    : IOException("GraphQL API Exception")