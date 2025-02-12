package edu.cit.campuscart.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorld {
    @GetMapping("/")
    public String print() {
        return "Hello Karen Lean Kay Cabarrubias";
    }
}
