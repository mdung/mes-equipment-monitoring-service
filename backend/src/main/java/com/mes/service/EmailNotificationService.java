package com.mes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${mes.notification.email.from:noreply@mes.com}")
    private String fromEmail;

    @Value("${mes.notification.email.enabled:false}")
    private Boolean emailEnabled;

    public void sendAlertEmail(String to, String subject, String body) {
        if (!emailEnabled || mailSender == null) {
            System.out.println("Email notification disabled or not configured");
            System.out.println("Would send email to: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendCriticalAlert(String to, String equipmentName, String alertMessage) {
        String subject = "[CRITICAL] Equipment Alert - " + equipmentName;
        String body = String.format(
            "CRITICAL ALERT\n\n" +
            "Equipment: %s\n" +
            "Alert: %s\n" +
            "Time: %s\n\n" +
            "Please take immediate action.\n\n" +
            "MES Pro - Equipment Monitoring System",
            equipmentName,
            alertMessage,
            java.time.LocalDateTime.now()
        );
        
        sendAlertEmail(to, subject, body);
    }
}
