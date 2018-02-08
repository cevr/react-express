import React, { Component } from 'react';

class App extends Component {
    constructor() {
        super();
        this.state = {
            elements: [],
            loggedIn: false,
            signUp: false,
            username: undefined
        };
    }

    componentDidMount() {
        fetch('/todos', {
            credentials: 'include',
            method: 'POST'
        })
            .then(x => {
                return x.text();
            })
            .then(x => {
                let fetched = JSON.parse(x);
                this.setState({
                    elements: fetched.list,
                    loggedIn: true,
                    username: fetched.user
                });
                console.log(JSON.parse(x));
            });
        console.log(this.state.elements);
    }
    add = () => {
        fetch('/addTodos', {
            method: 'POST',
            body: JSON.stringify({
                value: this.inp.value,
                username: this.state.username
            })
        });
        this.setState(st => {
            return { elements: st.elements.concat(this.inp.value) };
        });
    };

    clear = () => {
        fetch('clearTodos', {
            method: 'POST',
            body: JSON.stringify({
                credentials: 'include',
                username: this.state.username
            })
        })
            .then(x => {
                return x.text();
            })
            .then(x => {
                this.setState({ elements: JSON.parse(x) });
                console.log('hello');
            });
    };
    eventlisten = () => {
        this.inp.addEventListener('keypress', e => {
            if (e.keyCode === 13 && this.inp.value) {
                this.add();
                this.inp.value = '';
            }
        });
    };
    todoList = () => {
        return (
            <div>
                <input ref={r => (this.inp = r)} />
                <button onClick={this.add}>add it </button>
                <button onClick={this.clear}>clear it </button>

                <ul>
                    {this.state.elements.map((x, i) => (
                        <li key={`${i}`}> {x} </li>
                    ))}
                </ul>
            </div>
        );
    };

    signUpPage = () => {
        return (
            <div className="f3 tc">
                <input
                    type="username"
                    placeholder="username"
                    name="username"
                    ref={r => (this.username = r)}
                />
                <input
                    type="password"
                    placeholder="password"
                    name="password"
                    ref={r => (this.password = r)}
                />
                <button
                    onClick={() => {
                        if (this.username.value && this.password.value) {
                            fetch('/signUp', {
                                credentials: 'include',
                                method: 'POST',
                                body:
                                    this.username.value && this.password.value
                                        ? JSON.stringify({
                                              username: this.username.value,
                                              password: this.password.value
                                          })
                                        : null
                            }).then(() => this.setState({ signUp: true }));
                        }
                    }}
                >
                    Sign Up
                </button>
                <p>
                    Already have an account?{' '}
                    <button onClick={() => this.setState({ signUp: true })}>
                        Sign in here
                    </button>
                </p>
            </div>
        );
    };

    logInPage = () => {
        return (
            <div className="f3 tc">
                {' '}
                <input
                    type="username"
                    placeholder="username"
                    name="username"
                    ref={r => (this.username = r)}
                />
                <input
                    type="password"
                    placeholder="password"
                    name="password"
                    ref={r => (this.password = r)}
                />
                <button
                    onClick={() => {
                        if (this.username.value && this.password.value) {
                            fetch('/Login', {
                                credentials: 'include',
                                method: 'POST',
                                body:
                                    this.username.value && this.password.value
                                        ? JSON.stringify({
                                              username: this.username.value,
                                              password: this.password.value
                                          })
                                        : null
                            })
                                .then(x => x.text())
                                .then(x => {
                                    this.setState({
                                        username: this.username.value,
                                        elements: JSON.parse(x),
                                        loggedIn: true
                                    });
                                    console.log('test', JSON.parse(x));
                                    this.eventlisten();
                                });
                        }
                    }}
                >
                    Log In
                </button>
            </div>
        );
    };

    pageLoad = () => {
        if (this.state.loggedIn) {
            return this.todoList();
        } else {
            return this.state.signUp ? this.logInPage() : this.signUpPage();
        }
    };
    render() {
        return <div className="App">{this.pageLoad()}</div>;
    }
}

export default App;
