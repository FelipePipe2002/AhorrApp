package com.ahorrapp.service;

import com.ahorrapp.dto.TransactionDTO;
import com.ahorrapp.model.Transaction;
import com.ahorrapp.model.User;
import com.ahorrapp.repository.TransactionRepository;
import com.ahorrapp.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Transaction createTransaction(Transaction transaction, Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            transaction.setUser(userOptional.get());
            return transactionRepository.save(transaction);
        } else {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public ResponseEntity<Map<String, Object>> deleteTransaction(Long id, User user) {
        Optional<Transaction> transactionOptional = transactionRepository.findById(id);
        if (transactionOptional.isPresent()) {
            Transaction transaction = transactionOptional.get();
            if (transaction.getUser().getId().equals(user.getId())) {
                transactionRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Transaction not found"));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Transaction not found"));
        }
    }

    public Transaction createTransaction(TransactionDTO transactionRequest, User user) {
        Transaction transaction = new Transaction();
        transaction.setType(transactionRequest.getType());
        transaction.setCategory(transactionRequest.getCategory());
        transaction.setAmount(transactionRequest.getAmount());
        transaction.setDescription(transactionRequest.getDescription());
        transaction.setDate(transactionRequest.getDate());
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    public List<String> getCategories(Long id) {
        return transactionRepository.findDistinctCategoriesByUserId(id);
    }

    public Transaction updateTransaction(TransactionDTO transactionRequest, User user) {
        Optional<Transaction> transactionOptional = transactionRepository.findById(transactionRequest.getId());
        if (transactionOptional.isPresent()) {
            Transaction transaction = transactionOptional.get();
            if (transaction.getUser().getId().equals(user.getId())) {
                transaction.setType(transactionRequest.getType());
                transaction.setCategory(transactionRequest.getCategory());
                transaction.setAmount(transactionRequest.getAmount());
                transaction.setDescription(transactionRequest.getDescription());
                transaction.setDate(transactionRequest.getDate());
                return transactionRepository.save(transaction);
            } else {
                throw new IllegalArgumentException("Transaction not found");
            }
        } else {
            throw new IllegalArgumentException("Transaction not found");
        }
    }
}
