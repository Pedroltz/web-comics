import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiKey = environment.imgbb.apiKey;
  private apiUrl = 'https://api.imgbb.com/1/upload';

  constructor(private http: HttpClient) {}

  async uploadMultipleFiles(files: File[], mangaId: string, capituloNumero: number): Promise<string[]> {
    console.log('Iniciando upload de arquivos:', { numFiles: files.length });

    const uploadPromises = Array.from(files).map(async (file, index) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', this.apiKey);

      try {
        const response: any = await lastValueFrom(
          this.http.post(this.apiUrl, formData)
        );

        if (response.data?.url) {
          console.log(`Upload concluído para página ${index + 1}:`, response.data.url);
          return response.data.url;
        } else {
          throw new Error('URL não encontrada na resposta');
        }
      } catch (error) {
        console.error(`Erro no upload da página ${index + 1}:`, error);
        throw error;
      }
    });

    const urls = await Promise.all(uploadPromises);
    console.log('Todos os uploads concluídos:', urls);
    return urls;
  }
}