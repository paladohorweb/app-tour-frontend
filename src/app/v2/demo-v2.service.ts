import { DemoStoreService } from '../core/demo/demo-store.service';
import { Injectable } from '@angular/core';
import { DemoSessionService } from '../core/demo/demo-session.service';
import { DemoApiError } from '../core/demo/demo.models';
import { Experience, Booking, Slot, Notice } from './models';
@Injectable({ providedIn: 'root' })
export class DemoV2Service {
  private key = 'app-guia-demo-v3';
  private state: any;
  constructor(
    private session: DemoSessionService,
    private store: DemoStoreService,
  ) {
    try {
      this.state = JSON.parse(localStorage.getItem(this.key) || 'null');
    } catch {}
    if (!this.state) this.seed();
  }
  private seed() {
    const locations: Array<[string, string, string, number, number, Experience['kind'], number, string, string?]> = [
      ['Jardín: café, cascadas y pueblo', 'Jardín', 'Antioquia', 5.5994, -75.8193, 'TOUR', 85000, 'jardin', 'jardin'],
      ['Refugio junto al río Quindío', 'Salento', 'Quindío', 4.637, -75.57, 'STAY', 185000, 'salento'],
      ['Noche de historia en la Plaza Mayor', 'Villa de Leyva', 'Boyacá', 5.633, -73.524, 'EVENT', 68000, 'villa-de-leyva'],
      ['Guatapé desde la piedra y el agua', 'Guatapé', 'Antioquia', 6.233, -75.158, 'TOUR', 112000, 'guatape', 'guatape'],
      ['Cartagena: murallas al atardecer', 'Cartagena', 'Bolívar', 10.423, -75.551, 'TOUR', 138000, 'cartagena'],
      ['Casa colonial para desconectarte', 'Barichara', 'Santander', 6.635, -73.223, 'STAY', 210000, 'barichara'],
      ['Desfile de silleteros', 'Medellín', 'Antioquia', 6.2442, -75.5812, 'EVENT', 79000, 'medellin-flores', 'medellin-flores'],
      ['Carnaval: palco y experiencia cultural', 'Barranquilla', 'Atlántico', 10.9639, -74.7964, 'EVENT', 155000, 'barranquilla'],
      ['Cali vibra: noche de salsa', 'Cali', 'Valle del Cauca', 3.4516, -76.532, 'EVENT', 72000, 'cali'],
      ['Ruta de piloneras y vallenato', 'Valledupar', 'Cesar', 10.4631, -73.2532, 'EVENT', 88000, 'valledupar'],
      ['Mompox: magia frente al río', 'Santa Cruz de Mompox', 'Bolívar', 9.2419, -74.4267, 'STAY', 195000, 'mompox'],
    ];
    const experiences = locations.map((v, i): Experience => ({
      id: i + 1,
      ownerId: 2,
      title: v[0],
      municipality: v[1],
      department: v[2],
      latitude: v[3],
      longitude: v[4],
      meetingLatitude: v[3],
      meetingLongitude: v[4],
      kind: v[5],
      price: v[6],
      description: `Descubre ${v[1]} con una experiencia preparada por anfitriones locales. Incluye orientación antes de salir, punto de encuentro y acompañamiento durante el plan.`,
      address: `Zona central de ${v[1]} — ubicación ilustrativa`,
      meetingInstructions:
        'Punto ilustrativo del demo. En una reserva real, el prestador debe indicar el acceso exacto y cómo reconocerlo.',
      whatsapp: '',
      imageUrl: `/assets/media/places/${v[7]}.webp`,
      previewUrl: v[8] ? `/assets/media/previews/${v[8]}.mp4` : undefined,
      rnt: 'DEMO — no corresponde a un registro real',
      cancellationPolicy:
        'Condiciones ilustrativas: solicita cancelaciones o cambios al prestador. Los derechos legales aplicables prevalecen.',
      active: true,
    }));
    let slots: any[] = [];
    for (const e of experiences)
      for (let n = 1; n <= 30; n++) {
        let d = new Date();
        d.setDate(d.getDate() + n);
        slots.push({
          id: slots.length + 1,
          experienceId: e.id,
          date: d.toISOString().slice(0, 10),
          time: e.kind === 'STAY' ? '15:00' : '09:00',
          capacity: 12,
          available: 12,
        });
      }
    this.state = {
      experiences,
      slots,
      bookings: [],
      notices: [],
      preferences: {},
      privacy: [],
    };
    this.save();
  }
  private save() {
    localStorage.setItem(this.key, JSON.stringify(this.state));
  }
  private user() {
    return this.session.requireAuthenticated();
  }
  private fail(code: number, msg: string): never {
    throw new DemoApiError(code, msg);
  }
  private provider() {
    const u = this.user();
    if (!['ROLE_ADMIN', 'ROLE_GUIA'].includes(u.rol))
      this.fail(403, 'Solo prestadores');
    return u;
  }
  private owner(e: any) {
    const u = this.provider();
    if (u.rol !== 'ROLE_ADMIN' && e.ownerId !== u.id)
      this.fail(404, 'Experiencia no encontrada');
    return u;
  }
  private exp(id: number) {
    return (
      this.state.experiences.find((e: any) => e.id === id) ||
      this.fail(404, 'Experiencia no encontrada')
    );
  }
  private notice(
    userId: number,
    title: string,
    message: string,
    promotional = false,
  ) {
    this.state.notices.push({
      id: this.state.notices.length + 1,
      userId,
      title,
      message,
      promotional,
      seen: false,
      createdAt: new Date().toISOString(),
    });
  }
  private used(slot: Slot) {
    return this.state.bookings
      .filter(
        (b: any) =>
          (b.endDate
            ? b.experienceId === slot.experienceId &&
              b.date <= slot.date &&
              b.endDate > slot.date
            : b.slotId === slot.id) &&
          ['CONFIRMED', 'COMPLETED'].includes(b.status),
      )
      .reduce((n: number, b: any) => n + b.people, 0);
  }
  private checkNights(id: number, start: string, end: string, people: number) {
    const days = (Date.parse(end) - Date.parse(start)) / 86400000;
    if (!Number.isInteger(days) || days < 1 || days > 30)
      this.fail(400, 'Selecciona de 1 a 30 noches');
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.parse(start) + i * 86400000)
        .toISOString()
        .slice(0, 10);
      const s = this.state.slots.find(
        (s: any) => s.experienceId === id && s.date === date,
      );
      if (!s || this.used(s) + people > s.capacity)
        this.fail(409, 'Sin disponibilidad para la noche ' + date);
    }
    return days;
  }
  handle(method: string, path: string, body: any): any {
    const p = path.replace('/api/v2', '');
    body = body || {};
    const id = Number(p.match(/\/(\d+)/)?.[1]);
    if (method === 'GET' && p === '/experiences')
      return this.state.experiences.filter((e: any) => e.active);
    if (method === 'GET' && /^\/experiences\/\d+$/.test(p)) {
      let e = this.exp(id);
      if (!e.active) this.fail(404, 'Experiencia no disponible');
      return e;
    }
    if (method === 'GET' && p.endsWith('/slots'))
      return this.state.slots
        .filter((s: any) => s.experienceId === id)
        .map((s: any) => ({
          ...s,
          available: Math.max(0, s.capacity - this.used(s)),
        }));
    if (method === 'GET' && p === '/provider/experiences') {
      let u = this.provider();
      return this.state.experiences.filter(
        (e: any) => u.rol === 'ROLE_ADMIN' || e.ownerId === u.id,
      );
    }
    if (
      (method === 'POST' && p === '/provider/experiences') ||
      (method === 'PUT' && /^\/provider\/experiences\/\d+$/.test(p))
    ) {
      let u = this.provider();
      if (
        !body.title ||
        !body.description ||
        !body.municipality ||
        !body.department ||
        !/^57[0-9]{10}$/.test(body.whatsapp) ||
        !body.meetingInstructions ||
        !body.cancellationPolicy ||
        !body.rnt ||
        !(body.price > 0) ||
        !/^https:\/\//.test(body.imageUrl) ||
        ![
          body.latitude,
          body.longitude,
          body.meetingLatitude,
          body.meetingLongitude,
        ].every(Number.isFinite)
      )
        this.fail(400, 'Revisa los campos y el WhatsApp (57 + 10 dígitos).');
      let e =
        method === 'PUT'
          ? this.exp(id)
          : {
              id:
                Math.max(0, ...this.state.experiences.map((e: any) => e.id)) +
                1,
              ownerId: u.id,
              active: true,
            };
      if (method === 'PUT') this.owner(e);
      Object.assign(e, body, {
        id: e.id,
        ownerId: e.ownerId,
        active: e.active,
      });
      if (method === 'POST') this.state.experiences.push(e);
      this.save();
      return e;
    }
    if (method === 'PATCH' && p.endsWith('/active')) {
      let e = this.exp(id);
      this.owner(e);
      e.active = !!body.active;
      this.save();
      return null;
    }
    if (method === 'POST' && p.endsWith('/slots')) {
      this.owner(this.exp(id));
      if (!body.date || !body.time || body.capacity < 1 || body.capacity > 1000)
        this.fail(400, 'Revisa fecha y cupos');
      if (
        this.state.slots.some(
          (s: any) =>
            s.experienceId === id &&
            s.date === body.date &&
            s.time === body.time,
        )
      )
        this.fail(409, 'Ya existe ese horario');
      let s = { ...body, id: this.state.slots.length + 1, experienceId: id };
      this.state.slots.push(s);
      this.save();
      return s;
    }
    if (method === 'POST' && p === '/bookings') {
      let u = this.user();
      let old = this.state.bookings.find(
        (b: any) => b.userId === u.id && b.requestKey === body.requestKey,
      );
      if (old) return old;
      if (
        !body.acceptedTerms ||
        !body.acceptedPrivacy ||
        body.legalVersion !== '2026-09-v2'
      )
        this.fail(400, 'Acepta las políticas vigentes');
      let slot =
        this.state.slots.find((s: any) => s.id === body.slotId) ||
        this.fail(404, 'Horario no encontrado');
      let e = this.exp(slot.experienceId);
      if (
        !e.active ||
        !Number.isInteger(body.people) ||
        body.people < 1 ||
        body.people > 30 ||
        this.used(slot) + body.people > slot.capacity
      )
        this.fail(409, 'No hay cupos suficientes');
      let nights =
        e.kind === 'STAY'
          ? this.checkNights(e.id, slot.date, body.endDate, body.people)
          : 1;
      let b = {
        id: this.state.bookings.length + 1,
        experienceId: e.id,
        slotId: slot.id,
        userId: u.id,
        ownerId: e.ownerId,
        people: body.people,
        total: e.price * body.people * nights,
        status: 'REQUESTED',
        paymentStatus: 'PENDING',
        title: e.title,
        reference: 'DEMO-' + crypto.randomUUID().slice(0, 8),
        requestKey: body.requestKey,
        date: slot.date,
        endDate: body.endDate,
        cancellationSnapshot: e.cancellationPolicy,
        meetingLatitude: e.meetingLatitude,
        meetingLongitude: e.meetingLongitude,
        meetingInstructions: e.meetingInstructions,
        whatsapp: e.whatsapp,
        legalVersion: body.legalVersion,
        createdAt: new Date().toISOString(),
      };
      this.state.bookings.push(b);
      this.notice(
        u.id,
        'Solicitud registrada',
        b.reference + ' pendiente de confirmación',
      );
      this.notice(e.ownerId, 'Nueva solicitud', b.reference + ' · ' + b.title);
      this.save();
      return b;
    }
    if (method === 'GET' && p === '/bookings') {
      let u = this.user();
      return this.state.bookings
        .filter((b: any) => b.userId === u.id)
        .slice()
        .reverse();
    }
    if (method === 'GET' && p === '/provider/bookings') {
      let u = this.provider();
      return this.state.bookings
        .filter((b: any) => u.rol === 'ROLE_ADMIN' || b.ownerId === u.id)
        .slice()
        .reverse();
    }
    if (method === 'PATCH' && p.startsWith('/bookings/')) {
      let u = this.user();
      let b =
        this.state.bookings.find((b: any) => b.id === id) ||
        this.fail(404, 'Reserva no encontrada');
      const action = p.split('/').pop();
      let manager = u.rol === 'ROLE_ADMIN' || u.id === b.ownerId;
      if (action === 'cancel') {
        if (!manager && b.userId !== u.id)
          this.fail(404, 'Reserva no encontrada');
        if (!['REQUESTED', 'CONFIRMED'].includes(b.status))
          this.fail(409, 'Estado inválido');
        b.status = 'CANCELLED';
        if (b.paymentStatus === 'VERIFIED') b.paymentStatus = 'REFUND_REVIEW';
      } else {
        if (!manager) this.fail(404, 'Reserva no encontrada');
        if (action === 'confirm') {
          if (b.status !== 'REQUESTED') this.fail(409, 'Solicitud ya atendida');
          let slot = this.state.slots.find((s: any) => s.id === b.slotId);
          if (b.endDate)
            this.checkNights(b.experienceId, b.date, b.endDate, b.people);
          else if (this.used(slot) + b.people > slot.capacity)
            this.fail(409, 'No hay cupos suficientes');
          b.status = 'CONFIRMED';
        } else if (action === 'verify-payment') {
          if (b.status !== 'CONFIRMED' || b.paymentStatus !== 'PENDING')
            this.fail(409, 'Estado inválido');
          b.paymentStatus = 'VERIFIED';
        } else if (action === 'complete') {
          if (b.status !== 'CONFIRMED') this.fail(409, 'Estado inválido');
          b.status = 'COMPLETED';
        } else this.fail(400, 'Acción inválida');
      }
      this.notice(
        b.userId,
        'Actualización de reserva',
        b.reference + ' · ' + b.status + ' · ' + b.paymentStatus,
      );
      this.save();
      return b;
    }
    if (method === 'GET' && p === '/notifications') {
      let u = this.user();
      return this.state.notices
        .filter((n: any) => n.userId === u.id)
        .slice(-100)
        .reverse();
    }
    if (method === 'PATCH' && p.endsWith('/read')) {
      let u = this.user();
      let n =
        this.state.notices.find((n: any) => n.id === id && n.userId === u.id) ||
        this.fail(404, 'Aviso no encontrado');
      n.seen = true;
      this.save();
      return null;
    }
    if (method === 'GET' && p === '/preferences')
      return { marketing: !!this.state.preferences[this.user().id] };
    if (method === 'PUT' && p === '/preferences') {
      this.state.preferences[this.user().id] = !!body.marketing;
      this.save();
      return null;
    }
    if (method === 'POST' && p === '/admin/notifications') {
      this.session.requireRole('ROLE_ADMIN');
      let targets = this.store.getUsers().map((u) => u.id);
      let unique = [...new Set(targets)]
        .filter((id) => body.userId == null || id === body.userId)
        .filter((id) => !body.promotional || this.state.preferences[id]);
      for (let id of unique)
        this.notice(id, body.title, body.message, body.promotional);
      this.save();
      return { sent: unique.length };
    }
    if (method === 'POST' && p === '/privacy-requests') {
      let u = this.user();
      let req = {
        id: this.state.privacy.length + 1,
        userId: u.id,
        ...body,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };
      this.state.privacy.push(req);
      if (body.kind === 'REVOKE') this.state.preferences[u.id] = false;
      this.save();
      return req;
    }
    if (method === 'GET' && p === '/privacy-requests') {
      let u = this.user();
      return this.state.privacy.filter((r: any) => r.userId === u.id);
    }
    if (method === 'GET' && p === '/admin/privacy-requests') {
      this.session.requireRole('ROLE_ADMIN');
      return this.state.privacy;
    }
    if (method === 'PATCH' && p.endsWith('/close')) {
      this.session.requireRole('ROLE_ADMIN');
      let req =
        this.state.privacy.find((r: any) => r.id === id) ||
        this.fail(404, 'Solicitud no encontrada');
      req.status = 'CLOSED';
      this.save();
      return null;
    }
    this.fail(404, 'Ruta no disponible');
  }
}
