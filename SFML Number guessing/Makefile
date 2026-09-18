# Makefile for Number Guessing Game

CXX = g++
SFML_PATH = /opt/homebrew/opt/sfml
CXXFLAGS = -std=c++17 -Wall -I$(SFML_PATH)/include
SFML_FLAGS = -L$(SFML_PATH)/lib -lsfml-graphics -lsfml-window -lsfml-system
TARGET = number_guess
SOURCE = number_guess.cpp

all: $(TARGET)

$(TARGET): $(SOURCE)
	$(CXX) $(CXXFLAGS) $(SOURCE) -o $(TARGET) $(SFML_FLAGS)

clean:
	rm -f $(TARGET)

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
