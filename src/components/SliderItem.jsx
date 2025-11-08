import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import sliderItemStyles from './SliderItem.css.js';

const SliderItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={[
        sliderItemStyles.sliderItem,
        item.important && sliderItemStyles.importantItem
      ]}
      onPress={() => onPress(item)}
    >
      {/* Badge de importancia - fuera del contenido para posición absoluta */}
      {item.important && (
        <View style={sliderItemStyles.importantBadge}>
          <View style={sliderItemStyles.importantBadgeContainer}>
            <Text style={sliderItemStyles.importantBadgeText}>¡Importante!</Text>
          </View>
        </View>
      )}
      <View style={sliderItemStyles.sliderContent}>
        <Text 
          style={[
            sliderItemStyles.sliderItemTitle,
            item.important && sliderItemStyles.importantTitle
          ]} 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text 
          style={[
            sliderItemStyles.sliderItemDescription,
            item.important && sliderItemStyles.importantDescription
          ]} 
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SliderItem;