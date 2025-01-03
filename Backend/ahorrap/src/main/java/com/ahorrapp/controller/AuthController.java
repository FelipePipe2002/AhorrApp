package com.ahorrapp.controller;

import com.ahorrapp.dto.UserLoginDTO;
import com.ahorrapp.dto.UserRequestDTO;
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
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserLoginDTO userLoginDTO) {
        User user = userService.getUserByEmail(userLoginDTO.getEmail());
        if (user != null && userService.verifyPassword(userLoginDTO.getPassword(), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(401).body("Invalid email or password");
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


}
