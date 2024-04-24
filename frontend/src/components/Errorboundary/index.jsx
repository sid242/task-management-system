import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error) {
    this.setState({ hasError: true, error });
  }

  render() {
    if (this?.state?.hasError) {
      return (
        <div>
          <h3>Error: Something is wrong!</h3>
          <div>{this?.state?.error?.toString()}</div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
