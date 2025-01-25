package com.ahorrapp.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

public class IpValidationFilter extends OncePerRequestFilter {
    
    private static final List<String> ALLOWED_IP_RANGES = Arrays.asList( //only accepting requests from Argentina and 
            "181.0.0.0/8",
            "186.0.0.0/8",
            "192.168.0.0/16",
            "127.0.0.0/8"
    );
            

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        System.out.println("Client IP: " + clientIp);

        if (isIpAllowed(clientIp)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.getWriter().write("Access Denied: IP not allowed.");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim(); // En caso de múltiples IPs, toma la primera.
    }

    private boolean isIpAllowed(String ip) {
        return ALLOWED_IP_RANGES.stream().anyMatch(range -> isIpInRange(ip, range));
    }

    private boolean isIpInRange(String ip, String cidr) {
        try {
            String[] parts = cidr.split("/");
            String network = parts[0];
            int prefix = Integer.parseInt(parts[1]);

            long ipAddress = ipToLong(ip);
            long networkAddress = ipToLong(network);

            long mask = ~((1L << (32 - prefix)) - 1);

            return (ipAddress & mask) == (networkAddress & mask);
        } catch (Exception e) {
            return false;
        }
    }

    private long ipToLong(String ipAddress) {
        String[] octets = ipAddress.split("\\.");
        return (Long.parseLong(octets[0]) << 24)
                | (Long.parseLong(octets[1]) << 16)
                | (Long.parseLong(octets[2]) << 8)
                | Long.parseLong(octets[3]);
    }

}
