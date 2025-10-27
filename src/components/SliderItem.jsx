import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import sliderItemStyles from './SliderItem.css.js';

const SliderItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={sliderItemStyles.sliderItem}
      onPress={() => onPress(item)}
    >
      <View style={sliderItemStyles.sliderContent}>
        {/* Badge de importancia */}
        {item.important && (
          <View style={sliderItemStyles.importantBadge}>
            <Text style={sliderItemStyles.importantBadgeText}>¡Importante!</Text>
          </View>
        )}
        
        <Text 
          style={sliderItemStyles.sliderItemTitle} 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text 
          style={sliderItemStyles.sliderItemDescription} 
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SliderItem;