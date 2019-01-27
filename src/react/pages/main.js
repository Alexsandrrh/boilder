import React from 'react';
import ReactDOM from 'react-dom';
import Text from '../components/text';

class Main extends React.Component {
    render() {
        return (<div>
                    <Text phrase={'Hello world!!!'}/>
                </div>);
    }
}

ReactDOM.render(<Main/>, document.getElementById('root'));
