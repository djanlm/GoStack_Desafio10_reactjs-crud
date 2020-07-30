import React, { useState, useEffect } from 'react';

import { ThemeConsumer } from 'styled-components';
import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      await api.get<IFoodPlate[]>('/foods').then(response => {
        setFoods(response.data);
      });
    }
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { name, description, price, image } = food;
      api
        .post('/foods', {
          name,
          description,
          price,
          image,
          available: true,
        })
        .then(response => {
          setFoods([...foods, response.data]);
        });

      // await api.get<IFoodPlate[]>('/foods').then(response => {
      //   setFoods(response.data);
      // });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    // TODO UPDATE A FOOD PLATE ON THE API
    try {
      const { name, description, image, price } = food;
      api
        .put(`/foods/${editingFood.id}`, {
          name,
          description,
          image,
          price,
          available: editingFood.available,
        })
        .then(response => {
          const index = foods.findIndex(f => f.id === editingFood.id);
          // remove o elemento que foi editado do arrray foods.
          foods.splice(index, 1);
          // repoe o elemento depois da edição, retornado pelo servidor
          setFoods([...foods, response.data]);
        });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    const index = foods.findIndex(food => food.id === editingFood.id);
    // remove o elemento que será deletado do arrray foods. Assim nao é necessario fazer outra chamada a api pra retornar a lista de foods novamente
    foods.splice(index, 1);
    await api.delete(`/foods/${id}`);

    // await api.get<IFoodPlate[]>('/foods').then(response => {
    //   setFoods(response.data);
    // });
    setEditingFood({} as IFoodPlate);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    toggleEditModal();
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
