import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg';
import LeafletMap from './LeafletMap';
import { LatLngTuple } from 'leaflet';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}

interface IBGECityResponse {
  nome: string;
}

interface UF {
  initials: string;
  name: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Array<Item>>([]);
  const [ufs, setUfs] = useState<Array<UF>>([]);
  const [cities, setCities] = useState<Array<string>>([]);

  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');

  const [selectedPosition, setSelectedPosition] = useState<LatLngTuple>([0, 0]);
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const history = useHistory();

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    axios.get<Array<IBGEUFResponse>>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const listUF = response.data.map(uf => {
        let listUfs = {
          initials: uf.sigla,
          name: uf.nome
        }
        return listUfs;
      });
      setUfs(listUF);
    });
  }, []);

  useEffect(() => {
    // load cities when select UF
    if (selectedUF === '0') {
      return;
    }

    axios.get<Array<IBGECityResponse>>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);
        
        setCities(cityNames);
      });
  }, [selectedUF])
    
  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUF(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else
      setSelectedItems([ ...selectedItems, id ]);
  }

  function handleClickOnMap(position: LatLngTuple) {
    setSelectedPosition(position);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    };

    console.log(data);
    await api.post('points', data);

    alert('Ponto de coleta criado!');

    history.push('/');
  }

  const mapProps = {
    handleClick: handleClickOnMap
  }

  return (
    <div id="page-create-point">
      <div className="content">
        <header>
          <img src={logo} alt="Ecoleta" />

          <Link to="/">
            <FiArrowLeft />
            Voltar para Home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>Cadastro do <br /> ponto de coleta</h1>

          <fieldset>
            <legend><h2>Dados</h2></legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input 
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input 
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input 
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione um endereço no mapa</span>
            </legend>

            <LeafletMap {...mapProps} />

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
                  <option value="0">Selecione estado</option>
                  {ufs.map(uf => (
                    <option key={uf.initials} value={uf.initials}>{uf.initials} - {uf.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="cidade">Cidade</label>
                <select name="cidade" id="cidade" value={selectedCity} onChange={handleSelectCity}>
                  <option value="0">Selecione cidade</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais ítens abaixo</span>
            </legend>

            <ul className="items-grid">
              {items.map(item => {
                return (
                  <li 
                    key={item.id} 
                    onClick={() => handleSelectItem(item.id)}
                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                  >
                    <img src={item.image_url} alt={item.title} />
                    <span>{item.title}</span>
                  </li>
                );
              })}              
            </ul>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePoint;
