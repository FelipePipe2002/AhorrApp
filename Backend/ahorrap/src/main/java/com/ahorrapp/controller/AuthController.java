package com.ahorrapp.controller;

import com.ahorrapp.dto.UserLoginDTO;
import com.ahorrapp.dto.UserRequestDTO;
import com.ahorrapp.dto.UserResponseDTO;
import com.ahorrapp.model.User;
import com.ahorrapp.service.UserService;
import com.ahorrapp.util.JwtUtil;
import com.ahorrapp.util.mapperDTOModel;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserLoginDTO userLoginDTO, HttpServletResponse response) {
        User user = userService.getUserByEmail(userLoginDTO.getEmail());

        if (user != null && userService.verifyPassword(userLoginDTO.getPassword(), user.getPassword())) {

            String accessToken = jwtUtil.generateAccessToken(user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

            user.setRefreshToken(refreshToken);
            userService.updateUser(user);

            Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(true);
            refreshCookie.setPath("/auth");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // Expira en 7 días
            response.addCookie(refreshCookie);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("user", mapperDTOModel.mapToResponseDTO(user));
            responseBody.put("accessToken", accessToken);

            return ResponseEntity.ok(responseBody);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        Cookie refreshCookie = new Cookie("refreshToken", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/auth");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRequestDTO user, HttpServletResponse response) {
        if (userService.getUserByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(400).body(Map.of("error", "User already exists"));
        }

        User createdUser = userService.createUser(user);
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        createdUser.setRefreshToken(refreshToken);
        userService.updateUser(createdUser);

         Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
         refreshCookie.setHttpOnly(true);
         refreshCookie.setSecure(true);
         refreshCookie.setPath("/auth");
         refreshCookie.setMaxAge(7 * 24 * 60 * 60);
         response.addCookie(refreshCookie);
 
         Map<String, Object> responseBody = new HashMap<>();
         responseBody.put("user", mapperDTOModel.mapToResponseDTO(createdUser));
         responseBody.put("accessToken", accessToken);

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<Map<String, String>> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Refresh Token is required"));
        }

        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Refresh Token"));
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userService.getUserByEmail(email);

        if (user == null || !refreshToken.equals(user.getRefreshToken())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Refresh Token"));
        }

        // Generar nuevo Access Token
        String newAccessToken = jwtUtil.generateAccessToken(email);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @GetMapping("/verifyToken")
    public ResponseEntity<String> verifyToken(@RequestHeader("Authorization") String token) {
        System.out.println(token);
        token = token.substring(7); // Remove "Bearer " from token
        if (jwtUtil.validateToken(token)) {
            return ResponseEntity.ok("Token is valid");
        } else {
            return ResponseEntity.status(401).body("Token is invalid");
        }

    }

    @GetMapping("/status")
    public ResponseEntity<String> serverStatus() {
        return ResponseEntity.ok("Server is running");
    }

}
