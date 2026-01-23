package com.abc.enums;

public class test_1 {

    public static void main(String[] args) {
        User user = new User();

    }
}


class User {
    private String name;
    private Integer age;

    public String User(String name, Integer age) {
        this.name = name;
        this.age = age;
        return "success";
    }
}