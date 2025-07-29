import { Injectable } from '@nestjs/common';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { AlertsGateway } from '../gateways/alerts.gateway';
import { AlertsRepository } from '../repositories/alerts.repository';
import { QueryAlertsDto } from '../dto/query-alerts.dto';
import { FirestoreService } from 'src/common/database/firestore.service';
import * as admin from 'firebase-admin';  // Agregamos Firebase Admin

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsGateway: AlertsGateway,
    private readonly alertsRepository: AlertsRepository,
    private readonly firestore: FirestoreService
  ) {}

  async createAlert(alertData: any) {
    const savedAlert = await this.alertsRepository.create(alertData);

    this.alertsGateway.sendAlertToAll(savedAlert);

    const tokens = await this.getUserTokens(savedAlert.userId); 
    console.log(`Tokens recuperados para el usuario ${savedAlert.userId}: ${tokens}`);

    if(tokens) {
      await this.sendNotificationToUser(
        tokens,
        savedAlert,
        savedAlert.id,
      );
    }

    return savedAlert;
  }

  private async getUserTokens(userId: string): Promise<string | null> {
    try {
      const userRef = this.firestore.db.collection('users').doc(userId);
      const userSnap = await userRef.get();
  
      if (!userSnap.exists) {
        console.error(`Usuario con ID ${userId} no encontrado.`);
        return null;
      }
  
      const userData = userSnap.data();
  
      console.log(`Datos recuperados del usuario ${userId}:`, userData);
  
      if (userData?.token) {
        console.log(`Token FCM del usuario ${userId}: ${userData.token}`);
      } else {
        console.warn(`El usuario ${userId} no tiene un token FCM registrado.`);
      }
  
      return userData?.token || null;
    } catch (error) {
      console.error('Error al recuperar el token FCM:', error);
      return null;
    }
  }
  

  private async sendNotificationToUser(token: string, alertData: any,  alertid: string) {
    console.log('Enviando noti:', {token, alertData, alertid});
    console.log(alertData.tipo);
    let title = '';
    let body = '';

    switch(alertData.tipo){
      case 'Fuego Detectado':
        title = '¡Alerta! Fuego Detectado';
        body = `Temperatura: ${alertData.temperatura}°C. ¡Evacúa Inmediatamente!`;
        break;
      case 'Humo Detectado':
        title = '¡Alerta! Humo Detectado';
        body = `Temperatura: ${alertData.temperatura}°C. Revisa la zona con mucha precaución`;
        break;
        case 'Concentración de Gas Elevada':
        title = '¡Alerta! Elevacion de Gas Detectado';
        body = `Temperatura: ${alertData.concentracionGas} ppm. ¡Evacúa la zona!`;
        break;
      case 'Temperatura Elevada':
        title = '¡Alerta! Temperatura Elevada';
        body = `Temperatura: ${alertData.temperatura}°C. Revisa la zona por precaución`;
        break;
    }

    const message = {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: {
        aleriId: alertid,
        tipo: alertData.tipo
      }
    };
    try {
      await admin.messaging().send(message);
      console.log(`Notificación enviada a: ${token}`);
    } catch (error) {
      console.error(`Error al enviar FCM:`, error);
    }
  }

  async findAll(filters: QueryAlertsDto, user: User) {
    const repositoryFilters: any = { ...filters };

    if (user.role !== UserRole.ADMIN) {
      repositoryFilters.userId = user.id;
    }

    return this.alertsRepository.findAll(repositoryFilters);
  }
}
