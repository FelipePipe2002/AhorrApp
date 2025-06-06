package com.ahorrapp.controller;

import com.ahorrapp.dto.TransactionDTO;
import com.ahorrapp.model.User;
import com.ahorrapp.service.TransactionService;
import com.ahorrapp.service.UserService;
import com.ahorrapp.util.mapperDTOModel;

import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    //TODO: encrypt the transactions with a master key encrypted with the user's password and store it in the database

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addTransaction(
            @Valid @RequestBody TransactionDTO transactionRequest) {
        TransactionDTO transaction = mapperDTOModel.mapToResponseDTO(transactionService.createTransaction(transactionRequest, getUser()));
        return ResponseEntity.ok(Map.of("message", "Transaction created successfully", "transaction", transaction));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteTransaction(@RequestParam Long id) {
        transactionService.deleteTransaction(id, getUser());
        return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateTransaction(
            @Valid @RequestBody TransactionDTO transactionRequest) {
        try {
            TransactionDTO transaction = mapperDTOModel.mapToResponseDTO(transactionService.updateTransaction(transactionRequest, getUser()));
            return ResponseEntity.ok(Map.of("message", "Transaction updated successfully", "transaction", transaction));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "An error occurred while updating the transaction"));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<Map<String, Object>> getMyTransactions() {
        List<TransactionDTO> transactions = transactionService.getTransactionsByUserId(getUserId()).stream()
                .map(mapperDTOModel::mapToResponseDTO)
                .toList();
        return ResponseEntity.ok(Map.of("transactions", transactions));
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(Map.of("categories", transactionService.getCategories(getUserId())));
    }

    @PostMapping("/change-categories")
    public ResponseEntity<String> changeCategories(@RequestBody Map<String, Object> payload) {
        String newCategory = (String) payload.get("newCategory");
        @SuppressWarnings("unchecked")
        List<String> oldCategories = (List<String>) payload.get("oldCategories");

        if (newCategory == null || oldCategories == null || oldCategories.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid request data");
        }

        transactionService.changeCategories(getUser().getId(),newCategory, oldCategories);

        return ResponseEntity.ok("Categories updated successfully");
    }
    
    private Long getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.getUserByEmail(userEmail).getId();
    }

    private User getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userService.getUserByEmail(userEmail);
    }

}
