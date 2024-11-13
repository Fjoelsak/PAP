import math


def pyModules() -> None:
    print(math.pi)


def pyVariables() -> None:
    a = 3 + 5 + 10 + 123
    print(a)

    b = 'PeterMustermann'
    print(b)


def pyIntAndFloat() -> None:
    x = 3
    print(type(x))
    print('x =', x)
    print('x+1 =', x + 1)
    print('x**2 =', x ** 2)
    x += 1
    print('x+=1 equals', x)
    x *= 2
    print('x*=2 equals', x)
    y = 2.5
    print(type(y))
    print(y, y + 1, y * 2, y ** 2)


def pyBooleans() -> None:
    t, f = True, False
    print(type(t))
    print(t and f)  # Logical AND;
    print(t or f)  # Logical OR;
    print(not t)  # Logical NOT;
    print(t != f)  # Logical XOR;


def pyStrings() -> None:
    hello = 'hello'  # String literals can use single quotes
    world = "world"  # or double quotes; it does not matter
    print(hello, len(hello))
    hw = hello + ' ' + world  # String concatenation
    print(hw)
    hw12 = '{} {} {}'.format(hello, world, 12)  # string formatting
    print(hw12)


def pyStringsMethods() -> None:
    s = "hello"
    print(s.capitalize())  # Capitalize a string
    print(s.upper())  # Convert a string to uppercase; prints "HELLO"
    print(s.rjust(7))  # Right-justify a string, padding with spaces
    print(s.center(7))  # Center a string, padding with spaces
    print(s.replace('l', '(ell)'))  # Replace all instances of one substring with another
    print('  world '.strip())  # Strip leading and trailing whitespace


pyStringsMethods()
