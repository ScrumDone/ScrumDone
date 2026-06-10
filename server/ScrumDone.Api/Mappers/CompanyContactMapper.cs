using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class CompanyContactMapper
    {
        public static partial ContactPersonDto ToListItemDto(this ContactPerson companyContact);

    }
}
