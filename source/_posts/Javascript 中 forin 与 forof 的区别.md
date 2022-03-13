---
title: Javascript 中 for...in 与 for...of 的区别
date: 2021/02/27
abbrlink: 44115
tags:
  - 编程
---

TLDR：

- `for…in` 以任意顺序迭代对象的可枚举属性（包括原型链上的属性）；

- `for…of` 遍历迭代对象定义要迭代的数据；

### Object 类型

```javascript 
const obj = {
  name: 'wayne'
}
obj.age = 12
Object.defineProperty(obj, 'sex', { value: 'male' })

for (const item in obj) {
  console.log(item)   // 'name', 'age'
}

for (const item of obj) {   // TypeError: obj is not iterable
  console.log(item)
}
```

#### for...in Object

`for…in` 迭代对象的可枚举属性，所以输出：name、age；

没有输出 `sex` ，是因为通过 `Object.defineProperty()` 定义的属性，其属性描述符 `enumerable` 默认为 `false`；

直接通过赋值和属性初始化的属性，属性描述符 `enumerable` 默认为 `true`；


#### for...of Object

`for…of` 遍历迭代对象定义的数据；

为了实现可迭代，一个对象必须实现 `@@iterator` 方法，即会有一个 `Symbol.iterator` 属性；

由于 `obj` 没有实现可迭代协议，所以 `for…of` 一个 `Object` 会报错；

```javascript
Symbol.iterator in {}
// false

Symbol.iterator in []
// true
```

### Array 类型

```javascript
Object.prototype.objCustom = function() {};
Array.prototype.arrCustom = function() {};

const arr = [1, 2]
arr.foo = 'hello';

for (const item in arr) {
  console.log(item)    // '0', '1', 'foo', 'arrCustom', 'objCustom'
}

for (const item of arr) {
  console.log(item)    // 1, 2
}
```

#### for...in Array

`for…in` 遍历 `Array` 类型时依然遵循遍历所有可枚举属性原则；

数组中每一个元素都是可枚举的，并且其可枚举属性就是下标（与 Javascript 数组的底层实现方式契合）；

并且数组自身及原型链上的可枚举属性也都会被 `for…in` 列出，通常 `for…in` 会结合 `hasOwnProperty` 一起使用；

但是即使使用 `hasOwnProperty` 也只能过滤继承而来的可枚举属性，而自身的可枚举属性依然会被 `for…in` 遍历；


#### for...of Array

在 `for…of` 中，由于 `Array` 类型是内置可迭代对象，所以会按照 `@@iterator` 定义的规则来进行迭代；

所以 “`for…of` 用来迭代对象的 `value`” 这样描述并不准确，仅仅是因为在内置默认的迭代器中返回了对象的 `value`，对于迭代器的默认行为我们完全可以自定义其规则；

### 其他数据类型

#### String

```javascript
const str = 'hello'

for (const item in str) {
  console.log(item)    // '0', '1', '2', '3', '4',
}

for (const item of str) {
  console.log(item)    // 'h','e','l','l','o',
}
```

#### Set

```javascript
const set = new Set([1,2,3,4,5])

for (const item in set) {
  console.log(item)    // 无输出
}

for (const item of set) {
  console.log(item)    // 1, 2, 3, 4, 5
}
```

#### 内置可迭代对象

从数据类型的支持程度来看 `for…of` 要优于 `for…in`。

以下的内置可迭代对象均可用于 `for…of`：

- `String`
- `Array`
- `TypedArray`、`ArrayBuffer`、`NodeList` 等类数组类型
- `Map` 
- `Set`
- `arguments` 对象