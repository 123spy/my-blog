package com.abc.generics;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class test_2 {
    public static void main(String[] args) {
        ArrayList<String> strings = new ArrayList<>();
        strings.add("a");
        printList(strings);
        printList(new ArrayList<Integer>());
    }

    public static void printList(List<?> list) {
        for (Object o : list) { // 不管里面是什么，肯定是 Object
            System.out.println(o);
        }
        // 因为不知道类型，所以不能在此处进行添加
//        list.add("132");
    }
}
