function ValidationMessage({ message }) {

  return (
    <p className="validation-message" role="alert">
      {message}
    </p>
  );

}

export default ValidationMessage;
