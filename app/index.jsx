import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SimpleCheckbox from "./SimpleCheckbox";
import styles from "./AppStyles";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  //  array of Animated value for every task .
  const [animations] = useState(new Map());

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };
  // function for the add task
  const handleAddTask = () => {
    if (taskInput.trim() === "") return;
    const newTask = {
      id: Date.now(),
      text: taskInput,
      completed: false,
    };

    //  array of Animated value for every task  anime it opacity
    const fadeAnim = new Animated.Value(0); // Init opacity 0
    setTasks((prevTasks) => [...prevTasks, newTask]);

    animations.set(newTask.id, fadeAnim);

    Animated.timing(fadeAnim, {
      toValue: 1, // the task added  to full opacity
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTaskInput("");
  };

  const toggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };
  // Delete the task
  const deleteTask = (id) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    animations.delete(id); // remove the animation reference for the deleted task
  };
  // EDit the task
  const editTask = (id, newText) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
    setModalVisible(false);
    setEditingText("");
  };
  // model for the edit
  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>To-Do-List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter A New Task"
          value={taskInput}
          onChangeText={setTaskInput}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskItem,
              { opacity: animations.get(item.id) }, // Apply animation here
            ]}
          >
            <View style={styles.textContainer}>
              <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Text
                  style={[
                    styles.taskText,
                    item.completed
                      ? { textDecorationLine: "line-through", color: "gray" }
                      : null,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <View style={styles.checkboxContainer}>
                <SimpleCheckbox
                  isEnabled={item.completed}
                  onToggle={() => toggleComplete(item.id)}
                />
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Task</Text>
          <TextInput
            style={styles.modalInput}
            value={editingText}
            onChangeText={setEditingText}
            placeholder="Edit your task"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => editTask(editingTaskId, editingText)}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default App;
