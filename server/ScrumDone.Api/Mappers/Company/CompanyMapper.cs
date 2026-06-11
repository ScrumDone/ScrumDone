using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class CompanyMapper
    {
        [MapProperty(nameof(Company.ContactPeople), nameof(CompanyDetailDto.Contacts))]
        [MapProperty(nameof(Company.ContactPeople), nameof(CompanyDetailDto.ContactPeopleCount), Use = nameof(CountContactPeople))]
        [MapProperty(nameof(Company.Projects), nameof(CompanyDetailDto.ProjectCount), Use = nameof(CountProjects))]
        public static partial CompanyDetailDto ToDetailDto(this Company company);

        [MapProperty(nameof(Company.ContactPeople), nameof(CompanyListItemDto.MainContact), Use = nameof(GetPrimaryContact))]
        [MapProperty(nameof(Company.ContactPeople), nameof(CompanyListItemDto.ContactPeopleCount), Use = nameof(CountContactPeople))]
        [MapProperty(nameof(Company.Projects), nameof(CompanyListItemDto.ProjectsCount), Use = nameof(CountProjects))]
        public static partial CompanyListItemDto ToListItemDto(this Company company);

        public static partial ContactPersonDto ToContactPersonDto(this ContactPerson contactPerson);

        private static int CountContactPeople(ICollection<ContactPerson> contactPeople) => contactPeople.Count;
        private static int CountProjects(ICollection<Project> projects) => projects.Count;
        private static ContactPersonDto? GetPrimaryContact(ICollection<ContactPerson> contactPeople) =>
            contactPeople.FirstOrDefault(cp => cp.IsPrimary)?.ToContactPersonDto();
    }
}
