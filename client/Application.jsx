import React from 'react';
import $ from 'jquery';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import io from 'socket.io-client';

import Login from './Login.jsx';
import Logout from './Logout.jsx';
import Register from './Register.jsx';
import Lobby from './Lobby.jsx';
import Decks from './Decks.jsx';
import AddDeck from './AddDeck.jsx';
import EditDeck from './EditDeck.jsx';
import NotFound from './NotFound.jsx';
import NavBar from './NavBar.jsx';
import GameLobby from './GameLobby.jsx';
import GameBoard from './GameBoard.jsx';
import About from './About.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import Profile from './Profile.jsx';

import {toastr} from 'react-redux-toastr';

import version from '../version.js';

import * as actions from './actions';

var notAuthedMenu = [
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' }
];

var authedMenu = [
    { name: 'Profile', path: '/profile' },
    { name: 'Logout', path: '/logout' }
];

var leftMenu = [
    { name: 'Decks', path: '/decks' },
    { name: 'Play', path: '/play' },
    { name: 'About', path: '/about' }
];

class App extends React.Component {
    componentWillMount() {
        this.props.loadCards();
        this.props.loadPacks();
        this.props.loadFactions();

        $(document).ajaxError((event, xhr) => {
            if(xhr.status === 401) {
                this.props.navigate('/login');
            }
        });

        var queryString = this.props.token ? 'token=' + this.props.token + '&' : '';
        queryString += 'version=' + version;

        var socket = io.connect(window.location.origin, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax : 5000,
            reconnectionAttempts: Infinity,
            query: queryString
        });

        socket.on('connect', () => {
            this.props.socketConnected(socket);
        });

        socket.on('disconnect', () => {
            toastr.error('Connection lost', 'You have been disconnected from the lobby server, attempting reconnect..');
        });

        socket.on('reconnect', () => {
            toastr.success('Reconnected', 'The reconnection to the lobby has been successful');
            this.props.socketConnected(socket);
        });

        socket.on('games', games => {
            this.props.receiveGames(games);
        });

        socket.on('users', users => {
            this.props.receiveUsers(users);
        });

        socket.on('newgame', game => {
            this.props.receiveNewGame(game);
        });

        socket.on('gamestate', game => {
            this.props.receiveGameState(game, this.props.username);
        });

        socket.on('cleargamestate', () => {
            this.props.clearGameState();
        });

        socket.on('lobbychat', message => {
            this.props.receiveLobbyMessage(message);
        });

        socket.on('lobbymessages', messages => {
            this.props.receiveLobbyMessages(messages);
        });

        socket.on('passworderror', message => {
            this.props.receivePasswordError(message);
        });

        socket.on('handoff', server => {
            var url = '//' + server.address;
            if(server.port && server.port !== 80 && server.port !== 443) {
                url += ':' + server.port;
            }

            this.props.gameSocketConnecting(url + '/' + server.name);

            var gameSocket = io.connect(url, {
                path: '/' + server.name + '/socket.io',
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax : 5000,
                reconnectionAttempts: 5,
                query: this.props.token ? 'token=' + this.props.token : undefined
            });

            gameSocket.on('connect_error', (err) => {
                toastr.error('Connect Error', 'There was an error connecting to the game server: ' + err.message + '(' + err.description + ')');
            });

            gameSocket.on('disconnect', () => {
                toastr.error('Connection lost', 'You have been disconnected from the game server, attempting reconnect..');

                this.props.gameSocketDisconnect();
            });

            gameSocket.on('reconnecting', (attemptNumber) => {
                toastr.info('Reconnecting', 'Attempt number ' + attemptNumber + ' to reconnect..');

                this.props.gameSocketReconnecting(attemptNumber);
            });

            gameSocket.on('reconnect', () => {
                toastr.success('Reconnected', 'The reconnection has been successful');
                this.props.gameSocketConnected(gameSocket);
            });

            gameSocket.on('reconnect_failed', () => {
                toastr.error('Reconnect failed', 'Given up trying to connect to the server');
                this.props.sendGameSocketConnectFailed();
            });

            gameSocket.on('connect', () => {
                this.props.gameSocketConnected(gameSocket);
            });

            gameSocket.on('gamestate', game => {
                this.props.receiveGameState(game, this.props.username);
            });

            gameSocket.on('cleargamestate', () => {
                this.props.clearGameState();
            });
        });

        socket.on('banner', notice => {
            this.props.receiveBannerNotice(notice);
        });
    }

    componentDidUpdate() {
        this.props.receiveLobbyMessage({});
    }

    getUrlParameter(name) {
        name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    render() {
        var rightMenu = this.props.loggedIn ? authedMenu : notAuthedMenu;
        var component = {};

        var path = this.props.path;
        var pathArg = undefined;
        var idArg = undefined;
        var tokenArg = undefined;
        var index = path.indexOf('/decks/edit');

        if(index !== -1) {
            path = path.substr(index, 11);
            pathArg = this.props.path.substr(11 + 1);
        }

        index = path.indexOf('/reset-password');
        if(index !== -1) {
            path = path.substr(index, 15);
            idArg = this.getUrlParameter('id');
            tokenArg = this.getUrlParameter('token');
        }

        let boundActionCreators = bindActionCreators(actions, this.props.dispatch);

        switch(path) {
            case '/':
                component = <Lobby />;
                break;
            case '/login':
                component = <Login />;
                break;
            case '/logout':
                component = <Logout />;
                break;
            case '/register':
                component = <Register />;
                break;
            case '/decks':
                component = <Decks { ...boundActionCreators } />;
                break;
            case '/decks/add':
                component = <AddDeck />;
                break;
            case '/decks/edit':
                component = <EditDeck deckId={pathArg} />;
                break;
            case '/play':
                component = (this.props.currentGame && this.props.currentGame.started) ? <GameBoard /> : <GameLobby />;
                break;
            case '/about':
                component = <About />;
                break;
            case '/forgot':
                component = <ForgotPassword />;
                break;
            case '/reset-password':
                component = <ResetPassword id={ idArg } token={ tokenArg } />;
                break;
            case '/profile':
                component = <Profile />;
                break;
            default:
                component = <NotFound />;
                break;
        }

        return (<div>
            <NavBar leftMenu={leftMenu} rightMenu={rightMenu} title='The Iron Throne' currentPath={this.props.path} numGames={this.props.games.length} />
            <div className='container'>
                {component}
            </div>
        </div>);
    }
}

App.displayName = 'Application';
App.propTypes = {
    agendas: React.PropTypes.array,
    cards: React.PropTypes.array,
    clearGameState: React.PropTypes.func,
    currentGame: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    gameSocketConnectError: React.PropTypes.func,
    gameSocketConnected: React.PropTypes.func,
    gameSocketConnecting: React.PropTypes.func,
    gameSocketDisconnect: React.PropTypes.func,
    gameSocketReconnecting: React.PropTypes.func,
    games: React.PropTypes.array,
    loadCards: React.PropTypes.func,
    loadFactions: React.PropTypes.func,
    loadPacks: React.PropTypes.func,
    loggedIn: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    packs: React.PropTypes.array,
    path: React.PropTypes.string,
    receiveBannerNotice: React.PropTypes.func,
    receiveGameState: React.PropTypes.func,
    receiveGames: React.PropTypes.func,
    receiveJoinGame: React.PropTypes.func,
    receiveLobbyMessage: React.PropTypes.func,
    receiveLobbyMessages: React.PropTypes.func,
    receiveNewGame: React.PropTypes.func,
    receivePasswordError: React.PropTypes.func,
    receiveUsers: React.PropTypes.func,
    sendGameSocketConnectFailed: React.PropTypes.func,
    socketConnected: React.PropTypes.func,
    token: React.PropTypes.string,
    username: React.PropTypes.string
};

function mapStateToProps(state) {
    return {
        agendas: state.cards.agendas,
        cards: state.cards.cards,
        currentGame: state.games.currentGame,
        factions: state.cards.factions,
        games: state.games.games,
        packs: state.cards.packs,
        path: state.navigation.path,
        loggedIn: state.auth.loggedIn,
        token: state.auth.token,
        username: state.auth.username
    };
}

function mapDispatchToProps(dispatch) {
    let boundActions = bindActionCreators(actions, dispatch);
    boundActions.dispatch = dispatch;
    
    return boundActions;
}

const Application = connect(mapStateToProps, mapDispatchToProps)(App);

export default Application;
