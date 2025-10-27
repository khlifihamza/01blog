package com.dev.backend.exception;

public class InvalidPostDataException extends RuntimeException {
    public InvalidPostDataException(String message) {
        super(message);
    }
}