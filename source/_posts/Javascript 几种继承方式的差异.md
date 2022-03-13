---
title: Javascript 几种继承方式的差异
date: 2021/03/1
abbrlink: 42991
tags:
  - 编程
---

虽然 ES6 带来了 class 语法使得实现继承非常方便，但是了解 “老” 的继承实现，对理解 Javascript 还是非常有帮助的。

### 原型链继承

实现：**父类的实例为子类的原型。**

```javascript
// 父类
function SuperType () {
  this.property = true
  this.array = [1, 2, 3]
}
SuperType.prototype.getSuperValue = function () {
  return this.property
}

// 子类
function SubType () {
  this.subproperty = false
}
SubType.prototype = new SuperType();    // 实现原型链继承
SubType.prototype.constructor = SubType;    // 修复构造函数指向
SubType.prototype.getSubValue = function () {
  return this.subproperty
}

const instance = new SubType();
console.log(instance.getSuperValue())
```

#### 缺陷

1. 实例化子类时，无法向父类传递参数；

2. 所有子类公用原型（父类实例）中引用类型的值；（当 `instance.array` 被修改时，会影响到所有的子类实例）；

#### 思考

为什么基本数据类型的值不会被其他实例修改而影响呢？

### 借用构造函数继承

实现：**在子类的构造函数中，通过 `call` 改变 `this` 指向为当前实例，执行父类构造函数。**

```javascript
// 父类
function SuperType (name) {
    this.name = name
    this.colors = ['red', 'blue', 'yellow']
    this.sayName = function () {
      console.log(this.name)
    }
}

// 子类
function SubType (name) {
    SuperType.call(this, name)
}

const instance1 = new SubType('wayne')
const instance2 = new SubType('maggie')
instance1.sayName()
instance1.colors.push('black')

console.log(instance2.colors)   // ['red', 'blue', 'yellow']
```

如此一来，父类上的所有属性都从原型移到了实例自身上，解决了引用类型被共享的问题。

同时，子类在 `call` 调用时还能向父类构造函数传递参数。

#### 缺陷

原型链继承的两个缺点分别都被解决了，但同时也引入了另外的缺陷。

在上面的例子中，父类的方法定义在构造函数中，这会导致相同的方法在每一个实例中重复，造成不必要的开销。

但如果像原型链继承一样定义在 `prototype` 中又不能被子类继承。

为了解决这种问题引入了组合继承。

### 组合继承

实现：**组合继承通过借用构造函数继承父类的属性，通过原型链继承父类的方法。**

```javascript
// 父类
function SuperType (name) {
  this.name = name
  this.colors = ['red', 'blue', 'yellow']
}
SuperType.prototype.sayName = function () {
  console.log(this.name)
}

// 子类
function SubType (name, age) {
  SuperType.call(this, name)
  this.age = age
}
SubType.prototype = new SuperType()
SubType.prototype.constructor = SubType
SuperType.prototype.sayAge = function () {
  console.log(this.age)
}

const instance1 = new SubType('wayne', 18)
instance1.sayName()
instance1.sayAge()
instance1.colors.push('black')
console.log(instance1.colors)

const instance2 = new SubType('maggie', 18)
instance2.sayName()
instance2.sayAge()
console.log(instance2.colors)

console.log(instance1.sayAge === instance2.sayAge)
```

组合继承通过结合原型链继承和借用构造函数继承双方的优点成为了 JavaScript 中最常用的继承模式。

#### 缺陷

虽然组合继承模式已经集成了上面两种模式的优点，但依然还存在有缺陷。

仔细观察上面的代码可以发现，由于**调用了两次父类的构造函数**，导致在子类的实例和原型上存在**重复的属性**。只是由于原型链从下至上的访问顺序导致原型上的重复属性被屏蔽了。

### 原型式继承

使用构造函数能够创建自定义类，但有时我们需要的仅仅是一个继承了某些特定属性、方法的对象，而不需要一个类。对于这种情况可以使用原型式继承来完成。

原型式继承的实现方式有多种，主要思路是以基类为基础，通过某种方式**复制基类**来完成：

原型式继承和原型链继承一样，也会遇到引用类型值被共享的问题。

```javascript
const person= {
  name: 'wayne',
  friends: ['maggie', 'some girls']
}

// 通过 Object.create 实现
const anotherPerson = Object.create(person)
anotherPerson.name = 'maggie'
anotherPerson.friends.push('some boys')

// 通过 Object() 实现
const yetAnotherPerson = Object(person)
yetAnotherPerson.name = 'jack'
yetAnotherPerson.friends.push('cat')

// ...
```

### 寄生继承

原型继承的核心是复制要继承的基类，但通常我们还需要对基类进行一系列修改或增强。寄生继承借鉴了工厂模式，**将复制基类与增强的过程进行封装**。

虽然增加的逻辑能被复用，但被增强的方法本身却不能复用，存在额外的开销：


```javascript
function createAnother (original) {
  const clone = Object(original);
  clone.sayHi = function () {
    console.log('hi');
  }
  return clone
}
```

### 寄生组合式继承

原型继承、寄生继承缺点明显，很少单独使用。组合继承存在的问题也依然没有解决。

有没有更好的继承模式呢？

回忆一下组合继承存在的问题：**多次调用构造函数**、**实例属性与原型属性重复**。

等等…构造函数多次调用？
在原型继承与寄生继承中都是使用没有构造函数，能不能将寄生继承与组合继承结合起来取长补短呢？

答案就是寄生组合模式。

寄生组合模式就是通过借用构造函数来继承属性，通过原型链的混合形式来继承方法。在指定子类原型时不一定要通过实例化父类来实现，子类需要的无非就是父类原型上的方法，复制一份即可。

```javascript
function inheritancePrototype (superType, subType) {
  const prototype = Object(superType.prototype)
  subType.prototype = prototype
  subType.prototype.constructor = subType
}

function SuperType (name) {
  this.name = name
}
SuperType.prototype.sayName = function () {
  console.log(this.name)
}

function SubType (name, age) {
  SuperType.call(this, name)
  this.age = age
}
inheritancePrototype(SuperType, SubType)
SubType.prototype.sayAge = function () {
  console.log(this.age)
}
```

#### 思考

为什么需要有 `const prototype = Object(superType.prototype) `，直接 `subType.prototype = superType.prototype` 会出现什么问题？

