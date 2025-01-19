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
        String ipAddress = request.getRemoteAddr(); 
        String endpoint = request.getRequestURI();

        System.out.println("Incoming request from IP: " + ipAddress + " to " + endpoint);

        filterChain.doFilter(request, response); 

        int statusCode = response.getStatus();
        System.out.println("Response status: " + statusCode + " for IP: " + ipAddress);
    }
}
