import React, { Component } from 'react';
import { View, StyleSheet, Alert, ImageBackground } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';


import Header from './src/components/Header';
import InitialScreen from './src/components/initialScreen';
import MineField from './src/components/MineField';
import Timer from './src/components/Timer';
import params from './src/params';  

import {
  createMinedBoard,
  cloneBoard,
  openField,
  hadExplosion,
  wonGame,
  showMines,
  invertFlag,
  flagsUsed,
} from './src/functions';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
  },
};

const Stack = createStackNavigator();

class GameScreen extends Component {
  constructor(props) {
    super(props);
    this.state = this.createState();
    this.timerRef = React.createRef();
  }

  minesAmount = () => {
    const cols = params.getColumsAmount(this.props.route.params.difficultLevel);
    const rows = params.getRowsAmount(this.props.route.params.difficultLevel);
    const level = this.props.route.params.difficultLevel;
    let proportion = level;

    if (level === 0.3) {
      proportion = 0.15;
    }

    return Math.ceil(cols * rows * proportion);
  };

  createState = () => {
    const cols = params.getColumsAmount(this.props.route.params.difficultLevel);
    const rows = params.getRowsAmount(this.props.route.params.difficultLevel);
    return {
      board: createMinedBoard(rows, cols, this.minesAmount()),
      won: false,
      lost: false,
      gameStarted: false,
    };
  };

  onOpenField = (row, column) => {
    if (!this.state.gameStarted) {
      this.setState({ gameStarted: true });
      this.timerRef.current.start();
    }

    const { board } = this.state;
    const newBoard = cloneBoard(board);
    openField(newBoard, row, column);
    const lost = hadExplosion(newBoard);
    const won = wonGame(newBoard);

    if (lost) {
      showMines(newBoard);
      this.timerRef.current.stop();
      this.timerRef.current.reset();
      Alert.alert(
        'Derrota',
        'Oops! Você perdeu o jogo. Tente novamente!',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState(this.createState());
            },
          },
        ],
        { cancelable: false }
      );
    }

    if (won) {
      this.timerRef.current.stop();
      this.timerRef.current.reset();
      Alert.alert(
        'Vitória',
        'Parabéns! Você venceu o jogo!',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState(this.createState());
            },
          },
        ],
        { cancelable: false }
      );
    }

    this.setState({ board: newBoard, lost, won });
  };

  onSelectField = (row, column) => {
    const { board } = this.state;
    const newBoard = cloneBoard(board);
    invertFlag(newBoard, row, column);
    const won = wonGame(newBoard);

    if (won) {
      this.timerRef.current.stop();
      this.timerRef.current.reset();
      Alert.alert(
        'Parabéns',
        'Você venceu o jogo!',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState(this.createState());
            },
          },
        ],
        { cancelable: false }
      );
    }

    this.setState({ board: newBoard, won });
  };

  handleNewGame = () => {
    this.setState(this.createState());
    this.timerRef.current.reset();
  };

  render() {
    const { navigation } = this.props;
    const { board } = this.state;
    const flagsLeft = this.minesAmount() - flagsUsed(board);
    const blockSize = params.getBlockSize(
      params.getRowsAmount(this.props.route.params.difficultLevel),
      params.getColumsAmount(this.props.route.params.difficultLevel)
    );

    return (
      <ImageBackground source={require('./src/assets/images/op2.png')} style={styles.background} >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Header
              flagsLeft={flagsLeft}
              onNewGame={this.handleNewGame}
              onExit={() => navigation.navigate('Home')}
            />
          </View>
          <View style={styles.boardContainer}>
            <View style={[styles.board, { width: params.boardSize, height: params.boardSize }]}>
              <MineField
                board={board}
                onOpenField={this.onOpenField}
                onSelectField={this.onSelectField}
                blockSize={blockSize}
              />
            </View>
          </View>
          <View style={styles.timerContainer}>
            <Timer ref={this.timerRef} />
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={InitialScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  boardContainer: {
    flex: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default App;
