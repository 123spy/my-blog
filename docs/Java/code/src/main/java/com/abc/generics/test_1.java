package com.abc.generics;

public class test_1 {

    public static void main(String[] args) {
        test_1 test1 = new test_1();
        String data = test1.getData(new Integer(12), new Double(20.45));
        System.out.println(data);
    }

    // 泛型方法
    public <T, R> String getData(T a, R b) {
        return a.toString() + b.toString();
    }

}

/// 泛型类
class Result <T> {
    private T data;

    public Result(T data) {
        this.data = data;
    }

    public T getData() {
        return data;
    }

//    static T a;
//    public static void testData(T a) {
//
//    }
}

// 泛型接口
interface UserService<T, U> {

    public T getData(U u);

}

class UserServiceImpl implements UserService<String, Integer> {

    @Override
    public String getData(Integer integer) {
        return integer.toString();
    }
}
