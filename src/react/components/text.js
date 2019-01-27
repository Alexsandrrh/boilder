import React from 'react';

class Text extends React.Component{
    render() {
        return (<div>
                    <p>{ this.props.phrase }</p>
                </div>)
    }
}

export default Text;
