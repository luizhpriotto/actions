﻿using MediatR;
using Sentry;
using SME.SGP.Infra;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SME.SGP.Aplicacao
{
    public class EnviarFilaNotificacaoReestruturacaoPlanoAEECommandHandler : IRequestHandler<EnviarFilaNotificacaoReestruturacaoPlanoAEECommand, bool>
    {
        private readonly IMediator mediator;

        public EnviarFilaNotificacaoReestruturacaoPlanoAEECommandHandler(IMediator mediator)
        {
            this.mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        public async Task<bool> Handle(EnviarFilaNotificacaoReestruturacaoPlanoAEECommand request, CancellationToken cancellationToken)
        {
            var usuario = await mediator.Send(new ObterUsuarioLogadoQuery());
            var command = new EnviarNotificacaoReestruturacaoPlanoAEECommand(request.ReestruturacaoId, usuario);

            await mediator.Send(new PublicarFilaSgpCommand(RotasRabbitSgp.NotificarPlanoAEEReestruturado, command, Guid.NewGuid(), usuario));
            SentrySdk.AddBreadcrumb($"Envio Fila de Notificação de Reestruturação de PlanoAEE", "RabbitMQ");

            return true;
        }
    }
}
