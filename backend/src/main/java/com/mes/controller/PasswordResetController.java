package com.mes.controller;

import com.mes.dto.PasswordResetConfirm;
import com.mes.dto.PasswordResetRequest;
import com.mes.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
@CrossOrigin(origins = "*")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        try {
            String token = passwordResetService.createPasswordResetToken(request.getEmail());
            
            // In production, send email with reset link
            // For now, return token in response (development only!)
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset instructions sent to email");
            response.put("token", token); // Remove this in production!
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Don't reveal if email exists or not (security)
            Map<String, String> response = new HashMap<>();
            response.put("message", "If the email exists, password reset instructions have been sent");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirm request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password has been reset successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<?> validateToken(@PathVariable String token) {
        try {
            var resetToken = passwordResetService.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid token"));
            
            if (resetToken.getUsed()) {
                throw new RuntimeException("Token has been used");
            }
            
            if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("email", resetToken.getUser().getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
