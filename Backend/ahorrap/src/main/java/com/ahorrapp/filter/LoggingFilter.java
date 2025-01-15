package com.ahorrapp.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String ipAddress = request.getRemoteAddr();  // Get the client's IP address
        String endpoint = request.getRequestURI();  // Get the requested endpoint

        System.out.println("Incoming request from IP: " + ipAddress + " to " + endpoint);

        filterChain.doFilter(request, response);  // Continue with the filter chain

        // After the request is processed
        int statusCode = response.getStatus();  // Get the response status code
        System.out.println("Response status: " + statusCode + " for IP: " + ipAddress);
    }
}
