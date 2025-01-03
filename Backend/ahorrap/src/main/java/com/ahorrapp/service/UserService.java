package com.ahorrapp.service;

import com.ahorrapp.dto.UserRequestDTO;
import com.ahorrapp.dto.UserResponseDTO;
import com.ahorrapp.model.User;
import com.ahorrapp.repository.UserRepository;
import com.ahorrapp.util.mapperDTOModel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(UserRequestDTO user) {
        User newUser = new User();
        newUser.setName(user.getName());
        newUser.setLastname(user.getLastname());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(newUser);
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Iterable<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(mapperDTOModel::mapToResponseDTO).toList();
    }
}
