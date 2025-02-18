package com.ahorrapp.controller;

import com.ahorrapp.dto.UserLoginDTO;
import com.ahorrapp.dto.UserRequestDTO;
import com.ahorrapp.dto.UserResponseDTO;
import com.ahorrapp.model.User;
import com.ahorrapp.service.UserService;
import com.ahorrapp.util.JwtUtil;
import com.ahorrapp.util.mapperDTOModel;

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
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserLoginDTO userLoginDTO) {
        User user = userService.getUserByEmail(userLoginDTO.getEmail());
        if (user != null && userService.verifyPassword(userLoginDTO.getPassword(), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getEmail());
            UserResponseDTO userResponse = mapperDTOModel.mapToResponseDTO(user);
            Map<String, Object> response = new HashMap<>();
            response.put("user", userResponse);
            response.put("token", token);

            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid email or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRequestDTO user) {
        if (userService.getUserByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(400).body(Map.of("error", "User already exists"));
        }

        User createdUser = userService.createUser(user);
        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("user", mapperDTOModel.mapToResponseDTO(createdUser));
        response.put("token", token);

        return ResponseEntity.ok(response);
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

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello");
    }


}
