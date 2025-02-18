package com.ahorrapp.filter;

import org.springframework.stereotype.Component;
import javax.servlet.*;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class RemovePrefixFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String originalPath = httpRequest.getRequestURI();
        String auxPath = originalPath;
        // Elimina el prefijo /ahorrapp
        if (originalPath.startsWith("/ahorrapp")) {
            auxPath = originalPath.replaceFirst("/ahorrapp", "");
        }

        final String modifiedPath = auxPath;

        // Crea una nueva solicitud con la ruta modificada
        HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper(httpRequest) {
            @Override
            public String getRequestURI() {
                return modifiedPath;
            }
        };

        filterChain.doFilter(wrappedRequest, response);
    }
}