package secure_shop.backend.exception;

import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, HttpServletRequest req) {
        return buildErrorResponse("UNAUTHORIZED", ex.getMessage(), req, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex, HttpServletRequest req) {
        return buildErrorResponse("FORBIDDEN", ex.getMessage(), req, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return buildErrorResponse("UNAUTHORIZED", "Email hoặc mật khẩu không đúng", req, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildErrorResponse("FORBIDDEN", "Bạn không có quyền truy cập tài nguyên này", req, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UsernameNotFoundException ex, HttpServletRequest req) {
        return buildErrorResponse("NOT_FOUND", ex.getMessage(), req, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNoSuchElement(NoSuchElementException ex, HttpServletRequest req) {
        return buildErrorResponse("NOT_FOUND", ex.getMessage(), req, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String field = ((FieldError) err).getField();
            String message = err.getDefaultMessage();
            errors.put(field, message);
        });

        ErrorResponse error = ErrorResponse.builder()
                .error("VALIDATION_ERROR")
                .message("Dữ liệu đầu vào không hợp lệ")
                .details(errors)
                .path(req.getRequestURI())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(JWTVerificationException.class)
    public ResponseEntity<ErrorResponse> handleJwtError(JWTVerificationException ex, HttpServletRequest req) {
        return buildErrorResponse("INVALID_TOKEN", "Token không hợp lệ hoặc đã hết hạn", req, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex, HttpServletRequest req) {
        return buildErrorResponse("BAD_REQUEST", ex.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        return buildErrorResponse("INTERNAL_SERVER_ERROR",
                ex.getMessage(),
                req,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            String errorCode, String message, HttpServletRequest req, HttpStatus status) {

        ErrorResponse error = ErrorResponse.builder()
                .error(errorCode)
                .message(message)
                .path(req.getRequestURI())
                .status(status.value())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictException(
            ConflictException ex, 
            HttpServletRequest request // <-- Thêm 
    ) {
        
        // Gọi constructor đầy đủ 
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),                          // String message
                HttpStatus.CONFLICT.getReasonPhrase(),    // String details/error
                request.getRequestURI(),                  // String path
                HttpStatus.CONFLICT.value(),              // int status
                null,                                     // Map<String, String> validationErrors
                LocalDateTime.now()                       // LocalDateTime timestamp
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
}