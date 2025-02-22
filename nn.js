// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// Based on "Make Your Own Neural Network" by Tariq Rashid
// https://github.com/makeyourownneuralnetwork/

// This version of nn.js adds some functionality for evolution
// copy() and mutate()

// Sigmoid function
// This is used for activation
// https://en.wikipedia.org/wiki/Sigmoid_function
NeuralNetwork.sigmoid = function(x) {
    return 1 / (1 + pow(Math.E, -x));
};

// This is the Sigmoid derivative!
NeuralNetwork.dSigmoid = function(x) {
    return x * (1 - x);
};

NeuralNetwork.tanh = function(x) {
    return Math.tanh(x);
};

NeuralNetwork.dtanh = function(x) {
    return 1 / (pow(Math.cosh(x), 2));
};

// This is how we adjust weights ever so slightly
function mutate(x) {
    if (random(1) < 0.1) {
        let offset = randomGaussian() * 0.5;
        // var offset = random(-0.1, 0.1);
        let newx = x + offset;
        return newx;
    } else {
        return x;
    }
}

// Neural Network constructor function
function NeuralNetwork(inputnodes, hiddennodes, outputnodes, learning_rate, activation) {

    // If it's a copy of another NN
    if (arguments[0] instanceof NeuralNetwork) {
        let nn = arguments[0];
        this.inodes = nn.inodes;
        this.hnodes = nn.hnodes;
        this.onodes = nn.onodes;
        this.wih = nn.wih.copy();
        this.who = nn.who.copy();
        this.activation = nn.activation;
        this.derivative = nn.derivative;
        this.lr = this.lr;
    } else {
        // Number of nodes in layer (input, hidden, output)
        // This network is limited to 3 layers
        this.inodes = inputnodes;
        this.hnodes = hiddennodes;
        this.onodes = outputnodes;

        // These are the weight matrices
        // wih: weights from input to hidden
        // who: weights from hidden to output
        // weights inside the arrays are w_i_j
        // where link is from node i to node j in the next layer
        // Matrix is rows X columns
        this.wih = new Matrix(this.hnodes, this.inodes);
        this.who = new Matrix(this.onodes, this.hnodes);

        // Start with random values
        this.wih.randomize();
        this.who.randomize();

        // Default learning rate of 0.1
        this.lr = learning_rate || 0.1;

        // Activation Function
        if (activation == 'tanh') {
            this.activation = NeuralNetwork.tanh;
            this.derivative = NeuralNetwork.dtanh;
        } else {
            this.activation = NeuralNetwork.sigmoid;
            this.derivative = NeuralNetwork.dSigmoid;
        }

    }

}

NeuralNetwork.prototype.copy = function() {
    return new NeuralNetwork(this);
};

NeuralNetwork.prototype.mutate = function() {
    this.wih = Matrix.map(this.wih, mutate);
    this.who = Matrix.map(this.who, mutate);
};

// Train the network with inputs and targets
NeuralNetwork.prototype.train = function(inputs_array, targets_array) {

    // Turn input and target arrays into matrices
    let inputs = Matrix.fromArray(inputs_array);
    let targets = Matrix.fromArray(targets_array);

    // The input to the hidden layer is the weights (wih) multiplied by inputs
    let hidden_inputs = Matrix.dot(this.wih, inputs);
    // The outputs of the hidden layer pass through sigmoid activation function
    let hidden_outputs = Matrix.map(hidden_inputs, this.activation);

    // The input to the output layer is the weights (who) multiplied by hidden layer
    let output_inputs = Matrix.dot(this.who, hidden_outputs);

    // The output of the network passes through sigmoid activation function
    let outputs = Matrix.map(output_inputs, this.activation);

    // Error is TARGET - OUTPUT
    let output_errors = Matrix.subtract(targets, outputs);

    // Now we are starting back propogation!

    // Transpose hidden <-> output weights
    let whoT = this.who.transpose();
    // Hidden errors is output error multiplied by weights (who)
    let hidden_errors = Matrix.dot(whoT, output_errors);

    // Calculate the gradient, this is much nicer in python!
    let gradient_output = Matrix.map(outputs, this.derivative);
    // Weight by errors and learing rate
    gradient_output.multiply(output_errors);
    gradient_output.multiply(this.lr);

    // Gradients for next layer, more back propogation!
    let gradient_hidden = Matrix.map(hidden_outputs, this.derivative);
    // Weight by errors and learning rate
    gradient_hidden.multiply(hidden_errors);
    gradient_hidden.multiply(this.lr);

    // Change in weights from HIDDEN --> OUTPUT
    let hidden_outputs_T = hidden_outputs.transpose();
    let deltaW_output = Matrix.dot(gradient_output, hidden_outputs_T);
    this.who.add(deltaW_output);

    // Change in weights from INPUT --> HIDDEN
    let inputs_T = inputs.transpose();
    let deltaW_hidden = Matrix.dot(gradient_hidden, inputs_T);
    this.wih.add(deltaW_hidden);
};


// Query the network!
NeuralNetwork.prototype.query = function(inputs_array) {

    // Turn input array into a matrix
    let inputs = Matrix.fromArray(inputs_array);

    // The input to the hidden layer is the weights (wih) multiplied by inputs
    let hidden_inputs = Matrix.dot(this.wih, inputs);
    // The outputs of the hidden layer pass through sigmoid activation function
    let hidden_outputs = Matrix.map(hidden_inputs, this.activation);

    // The input to the output layer is the weights (who) multiplied by hidden layer
    let output_inputs = Matrix.dot(this.who, hidden_outputs);

    // The output of the network passes through sigmoid activation function
    let outputs = Matrix.map(output_inputs, this.activation);

    // Return the result as an array
    return outputs.toArray();
};