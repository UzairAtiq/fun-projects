#include <SFML/Graphics.hpp>
#include <iostream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <sstream>
#include <iomanip>

int main() {
    // Initialize random seed
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
    
    // Create window with modern dimensions
    sf::RenderWindow window(sf::VideoMode({800, 600}), "Number Guess", sf::Style::Close);
    window.setFramerateLimit(60);
    
    // Modern color palette
    const sf::Color bgColor(15, 15, 25);           // Deep dark blue
    const sf::Color accentColor(100, 150, 255);    // Soft blue
    const sf::Color successColor(80, 200, 120);    // Mint green
    const sf::Color errorColor(255, 100, 100);     // Soft red
    const sf::Color textColor(230, 230, 240);      // Off-white
    const sf::Color dimTextColor(140, 140, 160);   // Dim gray
    
    // Game variables
    int secretNumber = std::rand() % 100 + 1;  // Random number between 1-100
    int userGuess = 0;
    std::string inputText = "";
    std::string messageText = "I'm thinking of a number...";
    std::string hintText = "";
    const int maxAttempts = 5;
    int attempts = 0;
    bool gameWon = false;
    bool gameLost = false;
    
    // Load font
    sf::Font font;
    if (!font.openFromFile("/System/Library/Fonts/Helvetica.ttc")) {
        std::cerr << "Error loading font!" << std::endl;
        return -1;
    }
    
    // Title
    sf::Text titleText(font);
    titleText.setString("GUESS THE NUMBER");
    titleText.setCharacterSize(48);
    titleText.setFillColor(accentColor);
    titleText.setStyle(sf::Text::Bold);
    sf::FloatRect titleBounds = titleText.getLocalBounds();
    titleText.setOrigin({titleBounds.size.x / 2, titleBounds.size.y / 2});
    titleText.setPosition({400, 80});
    
    // Subtitle
    sf::Text subtitleText(font);
    subtitleText.setString("Between 1 and 100");
    subtitleText.setCharacterSize(20);
    subtitleText.setFillColor(dimTextColor);
    sf::FloatRect subBounds = subtitleText.getLocalBounds();
    subtitleText.setOrigin({subBounds.size.x / 2, subBounds.size.y / 2});
    subtitleText.setPosition({400, 125});
    
    // Message display (for hints)
    sf::Text messageDisplay(font);
    messageDisplay.setCharacterSize(24);
    messageDisplay.setFillColor(textColor);
    messageDisplay.setStyle(sf::Text::Bold);
    
    // Hint display
    sf::Text hintDisplay(font);
    hintDisplay.setCharacterSize(28);
    hintDisplay.setFillColor(accentColor);
    hintDisplay.setStyle(sf::Text::Bold);
    
    // Input box background
    sf::RectangleShape inputBox({200, 60});
    inputBox.setFillColor(sf::Color(30, 30, 45));
    inputBox.setOutlineColor(accentColor);
    inputBox.setOutlineThickness(3);
    inputBox.setPosition({300, 280});
    
    // Input text
    sf::Text inputDisplay(font);
    inputDisplay.setCharacterSize(36);
    inputDisplay.setFillColor(textColor);
    
    // Attempts display
    sf::Text attemptsDisplay(font);
    attemptsDisplay.setCharacterSize(20);
    attemptsDisplay.setFillColor(dimTextColor);
    
    // Draw attempt circles
    std::vector<sf::CircleShape> attemptCircles;
    for (int i = 0; i < maxAttempts; i++) {
        sf::CircleShape circle(12);
        circle.setPosition({300.f + i * 40.f, 400});
        circle.setFillColor(sf::Color(40, 40, 55));
        circle.setOutlineColor(dimTextColor);
        circle.setOutlineThickness(2);
        attemptCircles.push_back(circle);
    }
    
    // Instructions
    sf::Text instructionText(font);
    instructionText.setString("Type your guess and press ENTER  •  Press R to restart");
    instructionText.setCharacterSize(16);
    instructionText.setFillColor(dimTextColor);
    sf::FloatRect instBounds = instructionText.getLocalBounds();
    instructionText.setOrigin({instBounds.size.x / 2, instBounds.size.y / 2});
    instructionText.setPosition({400, 550});
    
    // Main game loop
    while (window.isOpen()) {
        while (std::optional event = window.pollEvent()) {
            if (event->is<sf::Event::Closed>()) {
                window.close();
            }
            
            if (const auto* textEntered = event->getIf<sf::Event::TextEntered>()) {
                if (!gameWon && !gameLost) {
                    // Handle numeric input
                    if (textEntered->unicode >= '0' && textEntered->unicode <= '9') {
                        if (inputText.length() < 3) {
                            inputText += static_cast<char>(textEntered->unicode);
                        }
                    }
                    // Handle backspace
                    else if (textEntered->unicode == 8 && !inputText.empty()) {
                        inputText.pop_back();
                    }
                }
            }
            
            if (const auto* keyPressed = event->getIf<sf::Event::KeyPressed>()) {
                // Enter key - submit guess
                if (keyPressed->code == sf::Keyboard::Key::Enter && !inputText.empty() && !gameWon && !gameLost) {
                    userGuess = std::stoi(inputText);
                    attempts++;
                    
                    if (userGuess == secretNumber) {
                        messageText = "🎉 CORRECT!";
                        hintText = "You guessed it in " + std::to_string(attempts) + " attempt" + (attempts == 1 ? "" : "s") + "!";
                        messageDisplay.setFillColor(successColor);
                        hintDisplay.setFillColor(successColor);
                        gameWon = true;
                        inputBox.setOutlineColor(successColor);
                    }
                    else if (attempts >= maxAttempts) {
                        messageText = "GAME OVER";
                        hintText = "The number was " + std::to_string(secretNumber);
                        messageDisplay.setFillColor(errorColor);
                        hintDisplay.setFillColor(errorColor);
                        gameLost = true;
                        inputBox.setOutlineColor(errorColor);
                    }
                    else if (userGuess < secretNumber) {
                        messageText = "TOO LOW ↑";
                        hintText = "Try a higher number";
                        messageDisplay.setFillColor(errorColor);
                        hintDisplay.setFillColor(dimTextColor);
                        inputBox.setOutlineColor(errorColor);
                    }
                    else {
                        messageText = "TOO HIGH ↓";
                        hintText = "Try a lower number";
                        messageDisplay.setFillColor(errorColor);
                        hintDisplay.setFillColor(dimTextColor);
                        inputBox.setOutlineColor(errorColor);
                    }
                    
                    inputText = "";
                }
                
                // R key - restart game
                if (keyPressed->code == sf::Keyboard::Key::R) {
                    secretNumber = std::rand() % 100 + 1;
                    userGuess = 0;
                    inputText = "";
                    messageText = "I'm thinking of a number...";
                    hintText = "";
                    attempts = 0;
                    gameWon = false;
                    gameLost = false;
                    messageDisplay.setFillColor(textColor);
                    hintDisplay.setFillColor(accentColor);
                    inputBox.setOutlineColor(accentColor);
                }
            }
        }
        
        // Update text displays
        messageDisplay.setString(messageText);
        sf::FloatRect msgBounds = messageDisplay.getLocalBounds();
        messageDisplay.setOrigin({msgBounds.size.x / 2, msgBounds.size.y / 2});
        messageDisplay.setPosition({400, 190});
        
        hintDisplay.setString(hintText);
        sf::FloatRect hintBounds = hintDisplay.getLocalBounds();
        hintDisplay.setOrigin({hintBounds.size.x / 2, hintBounds.size.y / 2});
        hintDisplay.setPosition({400, 230});
        
        std::string displayInput = inputText.empty() ? "_" : inputText;
        inputDisplay.setString(displayInput);
        sf::FloatRect inputBounds = inputDisplay.getLocalBounds();
        inputDisplay.setOrigin({inputBounds.size.x / 2, inputBounds.size.y / 2});
        inputDisplay.setPosition({400, 305});
        
        // Update attempt circles
        for (int i = 0; i < maxAttempts; i++) {
            if (i < attempts) {
                if (gameWon && i == attempts - 1) {
                    attemptCircles[i].setFillColor(successColor);
                    attemptCircles[i].setOutlineColor(successColor);
                } else {
                    attemptCircles[i].setFillColor(errorColor);
                    attemptCircles[i].setOutlineColor(errorColor);
                }
            } else {
                attemptCircles[i].setFillColor(sf::Color(40, 40, 55));
                attemptCircles[i].setOutlineColor(dimTextColor);
            }
        }
        
        attemptsDisplay.setString("Attempts: " + std::to_string(attempts) + " / " + std::to_string(maxAttempts));
        sf::FloatRect attBounds = attemptsDisplay.getLocalBounds();
        attemptsDisplay.setOrigin({attBounds.size.x / 2, attBounds.size.y / 2});
        attemptsDisplay.setPosition({400, 460});
        
        // Render
        window.clear(bgColor);
        
        // Draw all elements
        window.draw(titleText);
        window.draw(subtitleText);
        window.draw(messageDisplay);
        window.draw(hintDisplay);
        window.draw(inputBox);
        window.draw(inputDisplay);
        
        // Draw attempt circles
        for (auto& circle : attemptCircles) {
            window.draw(circle);
        }
        
        window.draw(attemptsDisplay);
        window.draw(instructionText);
        
        window.display();
    }
    
    return 0;
}
