import React, { useState } from 'react';
import {  View,  TextInput,  FlatList,  TouchableOpacity,  Text,  StyleSheet,} from 'react-native';

interface DynamicCategorySelectorProps {
  categories: string[];
  onCategoryChange: (category: string) => void;
}

const DynamicCategorySelector: React.FC<DynamicCategorySelectorProps> = ({
  categories,
  onCategoryChange,
}) => {
  const [query, setQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    onCategoryChange(text); 

    if (text.trim() === '') {
      setFilteredCategories([]);
    } else {
      const filtered = categories.filter((category) =>
        category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  const handleSelectCategory = (category: string) => {
    setQuery(category);
    onCategoryChange(category);
    setFilteredCategories([]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter or select a category"
        value={query}
        onChangeText={handleQueryChange}
      />
      {filteredCategories.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredCategories}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectCategory(item)}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default DynamicCategorySelector;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    maxHeight: 150,
    zIndex: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});
