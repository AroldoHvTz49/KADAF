export type RolUsuario = 'candidato' | 'empresa';

export interface Perfil {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  created_at: string;
}