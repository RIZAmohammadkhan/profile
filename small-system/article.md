# Python
---

## 🐍 Part 1: Basics of Python

### 1. Your First Python Program

In a file called `hello.py`, write:

```python
print("Hello, world!")
```

Run it in your terminal:

```bash
python3 hello.py
```

👉 `print()` is a **function** that shows output.

---

### 2. Variables & Data Types

Python doesn’t need you to declare variable types explicitly.

```python
# Numbers
age = 20          # integer
pi = 3.14159      # float

# Strings
name = "Riza"

# Booleans
is_student = True

print(name, "is", age, "years old.")
```

---

### 3. Input from User

```python
name = input("Enter your name: ")
print("Hello,", name)
```

⚡ Note: Input is always taken as a string.

---

### 4. Conditions (if/else)

```python
age = int(input("Enter your age: "))

if age >= 18:
    print("You are an adult.")
else:
    print("You are a minor.")
```

---

### 5. Loops

```python
# For loop
for i in range(5):   # 0,1,2,3,4
    print("i =", i)

# While loop
x = 0
while x < 3:
    print("x =", x)
    x += 1
```

---

### 6. Functions

```python
def greet(name):
    return "Hello " + name

print(greet("Riza"))
```

---

## 🛠 Your Turn

Try this small challenge:
👉 Write a Python program that asks the user for a number and prints whether it’s **even or odd**.

---

Do you want me to **teach you Python as a structured full course** (step by step with exercises),
or do you prefer a **fast-track crash course** to get you coding quickly?
