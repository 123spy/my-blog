package com.abc.collection.map;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;

public class test1 {

    public static void main(String[] args) {
        Map map = new LinkedHashMap();

        map.put("1", "a");
        map.put("2", "b");
        map.put("3", "c");
        map.put("4", "d");

        map.remove("1");

        System.out.println(map);

        LinkedList<String> list = new LinkedList<>();

    }

}
