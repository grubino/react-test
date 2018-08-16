
const RPSSelectionButton = (props) => (
  <button
    className={props.isSelected ? "selected" : ""}
    onClick={props.selectionFunction}>
    <img src={props.image}/>
  </button>
);

const RPSResult = (props) => (
  <div>
    <h2>{props.result === 'win' ? 'You Win!' : (props.result === 'lose' ? 'You Lose!' : "It's a Tie!")}</h2>
    <p>Your opponent chose: {props.computerChoiceImage}</p>
    <p>You chose: {props.humanChoiceImage}</p>
    <button onClick={props.resetFunction}>Click to play again</button>
  </div>
);

class RPS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: null,
      requesting: false,
      playerChoice: null,
      computerChoice: null,
      result: null,
      humanScore: 0,
      computerScore: 0,
      error: null,
    };
  }
  reset() {
    this.setState({
      selection: null,
      playerChoice: null,
      computerChoice: null,
      result: null,
    });
  }
  processResult(resJSON) {
    if (!resJSON.result) {
      this.setState({error: resJSON.message});
      setTimeout(() => this.setState({error: null}), 3000);
      return;
    }
    this.setState({
      playerChoice: resJSON.playerChoice,
      computerChoice: resJSON.computerChoice,
      result: resJSON.result,
      humanScore: resJSON.result === 'win' ? this.state.humanScore + 1 : this.state.humanScore,
      computerScore: resJSON.result === 'lose' ? this.state.computerScore + 1 : this.state.computerScore,
    });
  }
  processError(resErr) {
    this.setState({error: resErr});
    this.reset();
  }
  select(rps) {
    if (this.state.result !== null) {
      return;
    }
    this.setState({selection: rps});
  }
  makeRequest() {
    this.setState({requesting: true});
    fetch('http://localhost:5000/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ choice: this.state.selection }),
    }).then(res => res.json())
      .then(this.processResult.bind(this))
      .catch(err => alert(`There was an error: ${err}`))
      .finally(() => this.setState({requesting: false}));
  }
  static getImageName(rps) {
    return `images/${rps.charAt(0).toUpperCase() + rps.slice(1)}-50.png`;
  }
  render() {
    const that = this;
    return <div>
      <h2>First choose your weapon:</h2>
      {['rock', 'paper', 'scissors'].map((rps, i) => (
        <RPSSelectionButton key={i}
                            isSelected={this.state.selection === rps ? "selected" : ""}
                            selectionFunction={() => this.select(rps)}
                            image={RPS.getImageName(rps)}/>
      ))}
      {
        this.state.result !== null ?
          <RPSResult computerChoiceImage={<img src={RPS.getImageName(this.state.computerChoice)}/>}
                     humanChoiceImage={<img src={RPS.getImageName(this.state.playerChoice)}/>}
                     result={this.state.result}
                     resetFunction={() => this.reset()}/>
          : <div><h2>...then click play: </h2><button disabled={this.state.selection === null && !this.state.requesting}
                          onClick={() => this.makeRequest()}>
            <img src="images/Play-50.png"/>
          </button></div>
      }
      {
        this.state.error !== null ?
          <div className="error">
            <p className="error"> The server reported an error: "{this.state.error}"</p>
            <p className="error">Please click the play button again to retry</p>
          </div> : ''
      }
      <h2>Human Score: {this.state.humanScore} Computer Score: {this.state.computerScore}</h2>
    </div>;
  }
}

const domContainer = document.getElementById('rps');
ReactDOM.render(<RPS/>, domContainer);
