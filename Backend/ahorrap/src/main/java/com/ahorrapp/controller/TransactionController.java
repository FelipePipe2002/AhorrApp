package com.ahorrapp.controller;

import com.ahorrapp.dto.TransactionDTO;
import com.ahorrapp.model.User;
import com.ahorrapp.service.TransactionService;
import com.ahorrapp.service.UserService;
import com.ahorrapp.util.mapperDTOModel;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addTransaction(
            @Valid @RequestBody TransactionDTO transactionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User user = userService.getUserByEmail(userEmail);
        TransactionDTO transaction = mapperDTOModel.mapToResponseDTO(transactionService.createTransaction(transactionRequest, user));
        return ResponseEntity.ok(Map.of("message", "Transaction created successfully", "transaction", transaction));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteTransaction(@RequestParam Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User user = userService.getUserByEmail(userEmail);
        transactionService.deleteTransaction(id, user);
        return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
    }

    @GetMapping("/mine")
    public ResponseEntity<Map<String, Object>> getMyTransactions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User user = userService.getUserByEmail(userEmail);
        List<TransactionDTO> transactions = transactionService.getTransactionsByUserId(user.getId()).stream()
                .map(mapperDTOModel::mapToResponseDTO)
                .toList();
        return ResponseEntity.ok(Map.of("transactions", transactions));
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        Long userId = userService.getUserByEmail(userEmail).getId();
        return ResponseEntity.ok(Map.of("categories", transactionService.getCategories(userId)));
    }

}
