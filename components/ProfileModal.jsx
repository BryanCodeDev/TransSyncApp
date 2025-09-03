import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';

const ProfileModal = ({ visible, onClose, user, onLogout, onProfilePress }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black bg-opacity-50 justify-start items-end pt-16 pr-4"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white rounded-lg w-48 p-4">
          <View className="items-center mb-4">
            {user?.fotoPerfil ? (
              <Image 
                source={{ uri: user.fotoPerfil }} 
                className="w-16 h-16 rounded-full mb-2"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-blue-600 justify-center items-center mb-2">
                <Text className="text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            <Text className="font-semibold">{user?.name || 'Usuario'}</Text>
            <Text className="text-gray-600 text-sm">{user?.email}</Text>
          </View>
          
          <TouchableOpacity 
            className="py-3 border-b border-gray-200"
            onPress={onProfilePress}
          >
            <Text>Mi Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text>Configuración</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="py-3"
            onPress={onLogout}
          >
            <Text className="text-red-600">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ProfileModal;